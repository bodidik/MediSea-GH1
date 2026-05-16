import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';
import winston from 'winston';
const transports = [new winston.transports.Console({ level: 'info' })];
if (process.env.LOGTAIL_SOURCE_TOKEN) {
  const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
  transports.push(new LogtailTransport(logtail));
}
const logger = winston.createLogger({ level:'info', format:winston.format.json(), transports });
export default logger;
