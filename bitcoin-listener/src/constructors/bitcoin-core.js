const url = require('url');
const Client = require('bitcoin-core');

const bitcoinCoreUrl = url.parse(process.env.BITCOIN_HTTPS_ADDR)

const bitcoinCoreOptions = {
  network,
  host: bitcoinCoreUrl.host,
  version: process.env.BITCOIN_CORE_VERSION,
  username: process.env.BITCOIN_CORE_USER,
  password: process.env.BITCOIN_CORE_PASS,
  port: process.env.BITCOIN_CORE_PORT,
}

if (bitcionCoreUrl.protocol === 'https') {
  bitcoinCoreOptions.ssl = {
    enabled: true,
    strict: false
  }
}

module.exports = new Client({ ...bitcoinCoreOptions });