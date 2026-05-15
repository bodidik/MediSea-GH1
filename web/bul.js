const fs = require('fs');
const path = require('path');

// Aramaya başlayacağımız yer: web/app klasörü
const startPath = path.join(process.cwd(), 'app');

function searchPages(dir) {
    if (!fs.existsSync(dir)) {
        return;
    }

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Klasörse içine girip aramaya devam et
            searchPages(filePath);
        } else if (file === 'page.tsx' || file === 'page.js') {
            // Eğer dosya ismi page.tsx ise, yolunu ekrana bas
            console.log("📄 BULUNDU: " + filePath);
            
            // İçinde "KLİNİK REHBER" yazısı geçiyor mu kontrol et (Senin ekranındaki yazı)
            const content = fs.readFileSync(filePath, 'utf-8');
            if (content.includes('KLİNİK REHBER')) {
                console.log("   🚨 SUÇLU DOSYA BU OLABİLİR! (İçinde 'KLİNİK REHBER' yazıyor)");
            }
        }
    }
}

console.log("--- PROJEDEKİ TÜM SAYFA DOSYALARI TARANIYOR ---");
searchPages(startPath);
console.log("--- TARAMA BİTTİ ---");