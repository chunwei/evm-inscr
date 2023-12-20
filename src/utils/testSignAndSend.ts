import { Address, Tx } from '@cmdcode/tapscript'

async function postData(url: string, data: BodyInit | null, contextType = 'application/json', apiKey = '') {
  const headers: HeadersInit = { 'Content-Type': contextType }
  if (apiKey) headers['X-Api-Key'] = apiKey
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  })
  return await res.text()
}

async function signsend() {
  //   const payAddress = 'tb1patpv03zdf3zhu88pg6slrpw9mtaxejhkmyms5hlk80vq05l38vcs56fee3'
  //   const toAddress = 'tb1p3tus3zvg5srgdjmmfjp2awgvl80fx4qk9gertkr4ryjyav63fexs8qklqx'
  //   const tx = Tx.create({
  //     vin: [
  //       {
  //         txid: 'd855a2f2c5201079623c883bd718130c3593e3eaba9283089123141a97d21217',
  //         vout: 0,
  //         prevout: {
  //           value: 2000,
  //           scriptPubKey: ['OP_1', Address.p2tr.decode(payAddress)]
  //         },
  //         witness: ['xxx']
  //       }
  //     ],
  //     vout: [
  //       {
  //         value: 1000,
  //         scriptPubKey: Address.toScriptPubKey(toAddress)
  //       }
  //     ]
  //   })

  //   const rawtx = Tx.encode(tx).hex
  const signedTx =
    '020000000001011712d2971a142391088392baeae393350c1318d73b883c62791020c5f2a255d80000000000ffffffff01e8030000000000002251208af9088988a40686cb7b4c82aeb90cf9de9354162a3235d87519244eb3514e4d0140e8e35d5d8d16ec074310a5cf336742bedea37a45e923639a3ce499af2b4fb770bcfd772a6378c7d6858d9e42d9b423a2bf8174443eba6603d27558099a1c957700000000'
  const txid = await postData('https://mempool.space/testnet/api/tx', signedTx)
  console.log(txid)
}

// signsend()

export async function signTxJS(params: any) {
  const signServer = 'http://localhost:7989'
  return postData(signServer + '/sign/taproot/hash', params)
}

async function sign() {
  const sigJS = await signTxJS({
    tweakPrivateKey: true,
    privateKey: '0c9181638b7c1c761651fe6bbc4786017eeedf881b25c393881a901c7c94752f',
    hash: 'bea663e5acd59f3b998ed062edda4e3061c753c9544839f135b56643a0e96797'
  })
  console.log(sigJS)
}
sign()
