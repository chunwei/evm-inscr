import { Bytes, Script, Tx, TxData, TxTemplate } from '@cmdcode/tapscript'

function txsize(tx: TxData | TxTemplate | Bytes) {
  const txData = Tx.fmt.toJson(tx)
  const bsize = Tx.util.getTxSize(txData)
  console.log('witness', Tx.util.readWitness(txData.vin[0].witness))
  console.log('scriptPubkey', Tx.util.readScriptPubKey(txData.vout[0].scriptPubKey))
  console.log('txsize: ', bsize)
}

const witness = [
  '1232b5954a14d5e855677a87abd59a5e7244ed94b3b269c0a1aa369fb6fcbf4dea5128773bd165de4906726b51030f5b7ca2dfe5198dae0e19d3a97219c0d921'
]
console.log('witness size:', Script.encode(witness).length)
const demoTx: TxTemplate = {
  vin: [
    {
      txid: '755a1f4fc8bccfa024bccc6f407227c1adc32ed2dcaa2713496e873a7926a686',
      vout: 0,
      witness
    }
  ],
  vout: [{ value: 10000, scriptPubKey: ['OP_1', '8af9088988a40686cb7b4c82aeb90cf9de9354162a3235d87519244eb3514e4d'] }]
}
txsize(demoTx)
const txHex = Tx.encode(demoTx).hex
console.log('hex', txHex)
// const txHex = 'c1d86fba108e30fb656e5c1339c0bb279cfba623090186db64d176bb81fd8d61'
const decodedTx = Tx.decode(txHex)
console.log('decodedTx', decodedTx)
txsize(decodedTx)
