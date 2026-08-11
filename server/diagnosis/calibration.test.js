// FILE: server/diagnosis/calibration.test.js

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  multiclassBrier,
  logLoss,
  calibrationCurve,
  expectedCalibrationError,
  topKAccuracy,
  calibrationReport,
} from './calibration.js';

const rec = (probabilities, actual) => ({ probabilities, actual });

test('kusursuz tahmin: Brier 0, ECE 0', () => {
  const records = [
    rec({ a: 1, b: 0 }, 'a'),
    rec({ a: 0, b: 1 }, 'b'),
  ];
  assert.equal(multiclassBrier(records), 0);
  assert.equal(expectedCalibrationError(records), 0);
  assert.equal(topKAccuracy(records, 1), 1);
});

test('Brier elle hesaplanabilir', () => {
  // (0.7-1)² + (0.3-0)² = 0.09 + 0.09 = 0.18
  const records = [rec({ a: 0.7, b: 0.3 }, 'a')];
  assert.ok(Math.abs(multiclassBrier(records) - 0.18) < 1e-12);
});

test('tesadüfi tahmin bilgili tahminden kötüdür', () => {
  const informed = [
    rec({ a: 0.8, b: 0.2 }, 'a'),
    rec({ a: 0.2, b: 0.8 }, 'b'),
  ];
  const coin = [
    rec({ a: 0.5, b: 0.5 }, 'a'),
    rec({ a: 0.5, b: 0.5 }, 'b'),
  ];
  assert.ok(multiclassBrier(informed) < multiclassBrier(coin));
  assert.ok(logLoss(informed) < logLoss(coin));
});

test('aşırı güvenli tahminci ECE ile yakalanır', () => {
  // %95 diyor, 10 vakanin 5'inde tutuyor -> ~0.45 sapma.
  const records = Array.from({ length: 10 }, (_, i) =>
    rec({ a: 0.95, b: 0.05 }, i < 5 ? 'a' : 'b'));

  const ece = expectedCalibrationError(records);
  assert.ok(ece > 0.4, `ECE beklenenden düşük: ${ece}`);

  const bucket = calibrationCurve(records).find((b) => b.n > 0);
  assert.equal(bucket.n, 10);
  assert.ok(Math.abs(bucket.meanConfidence - 0.95) < 1e-9);
  assert.ok(Math.abs(bucket.accuracy - 0.5) < 1e-9);
  assert.ok(bucket.gap < 0, 'gap negatif olmalı (aşırı güven)');
});

test('iyi kalibre tahminci düşük ECE verir', () => {
  // %70 diyen 10 vakanin 7'si tutuyor.
  const records = Array.from({ length: 10 }, (_, i) =>
    rec({ a: 0.7, b: 0.3 }, i < 7 ? 'a' : 'b'));
  assert.ok(expectedCalibrationError(records) < 1e-9);
});

test('topK doğru tanıyı ilk k içinde arar', () => {
  const records = [rec({ a: 0.5, b: 0.3, c: 0.2 }, 'c')];
  assert.equal(topKAccuracy(records, 1), 0);
  assert.equal(topKAccuracy(records, 2), 0);
  assert.equal(topKAccuracy(records, 3), 1);
});

test('rapor differential dizisini de kabul eder', () => {
  const report = calibrationReport([
    {
      differential: [
        { id: 'primary_hyperparathyroidism', probability: 0.6 },
        { id: 'hypothyroidism', probability: 0.4 },
      ],
      actual: 'primary_hyperparathyroidism',
    },
  ]);
  assert.equal(report.n, 1);
  assert.equal(report.top1, 1);
  assert.ok(report.brier > 0 && report.brier < 1);
});

test('boş girdi çökmez', () => {
  assert.equal(multiclassBrier([]), 0);
  assert.equal(logLoss([]), 0);
  assert.equal(expectedCalibrationError([]), 0);
  assert.equal(calibrationReport([]).n, 0);
});

test('kayıtta olasılık yoksa hata verir', () => {
  assert.throws(() => multiclassBrier([{ actual: 'a' }]), /probabilities/);
});
