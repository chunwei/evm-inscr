import { Buff } from '@cmdcode/buff-utils';
import { PublicKey, SecretKey, secp } from '@cmdcode/crypto-utils';
import { Address, Script, Signer, Tap, Tx } from '@cmdcode/tapscript';
import { IFile } from '@types';
import fs from 'fs/promises';
import { URL } from 'url';


export function hexToBytes(hex: string) {
  const matches = hex.match(/.{1,2}/g)
  if (matches) {
    return Uint8Array.from(matches.map((byte) => parseInt(byte, 16)))
  } else {
    // 处理空值情况
    return new Uint8Array(0) // 返回空的 Uint8Array
  }
  // return Uint8Array.from(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
function bytesToString(bytes: Uint8Array) {
  const decoder = new TextDecoder()
  return decoder.decode(bytes)
}

const VERBOSE = true

const privateKey = 'e8df3f377dd6eb7f3c1647e5c17853698e239545e4142315249e24f68c60e5f5'

export async function testAddress() {
  /* The code marked below is a quick example of how to load an image
   * within a NodeJS environment. It may not work in other environments.
   *
   * For examples of how to convert images into binary from within a browser
   * environment, please check out the Web File API:
   * https://developer.mozilla.org/en-US/docs/Web/API/File
   */
  const imgpath1 = new URL('./brc20.txt', import.meta.url).pathname
  const imgpath = new URL('./myfile.webp', import.meta.url).pathname
  const imgdata = await fs.readFile(imgpath).then((e) => new Uint8Array(e))
  /* * */

  // The 'marker' bytes. Part of the ordinal inscription format.
  const marker = Buff.encode('ord')
  /* Specify the media type of the file. Applications use this when rendering
   * content. See: https://developer.mozilla.org/en-US/docs/Glossary/MIME_type
   */
  const mimetype1 = Buff.encode('text/plain;charset=utf-8')
  const mimetype = Buff.encode('image/webp')
  // Create a keypair to use for testing.
  const secret = privateKey // '1abeb60666683a3db796b5d64afa229d16025b2cf512573129ddfa87d4847c36' // '97664508676c110ff75f3b42cb128ecd8d6fd25a6e7be5779659419b36fe8a0f' //'0a7d01d1c2e1592a02ea7671bb79ecd31d8d5e660b008f4b10e67787f4f24712'
  const seckey = new SecretKey(secret, { type: 'taproot' })
  const pubkey = seckey.pub
  // Basic format of an 'inscription' script.
  const script = [pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', imgdata, 'OP_ENDIF']
  // For tapscript spends, we need to convert this script into a 'tapleaf'.
  const tapleaf = Tap.encodeScript(script)
  // Generate a tapkey that includes our leaf script. Also, create a merlke proof
  // (cblock) that targets our leaf and proves its inclusion in the tapkey.
  const [tpubkey, cblock] = Tap.getPubKey(pubkey, { target: tapleaf })
  // A taproot address is simply the tweaked public key, encoded in bech32 format.
  const address = Address.p2tr.fromPubKey(tpubkey, 'testnet')
  console.log('----------------------------------')
  if (VERBOSE) console.log('Your address:', address)

  console.log('mimedata: ' + bytesToString(imgdata))
  console.log('mimedata hex: ' + bytesToHex(imgdata))
  console.log('mimetype: ' + bytesToString(mimetype))
  console.log('mimetype hex: ' + bytesToHex(mimetype))
  console.log('script: ', script)
  // console.log('script hex: ' + bytesToHex(script))
  console.log('privkey: ' + bytesToHex(seckey))
  console.log('pubKey: ' + bytesToHex(pubkey))
  console.log('leaf: ' + tapleaf)
  console.log('tpubkey: ' + tpubkey)
  console.log('cblock: ' + cblock)
  console.log('address: ' + address)

  const leaf1 = Tap.tree.getLeaf(Script.encode(script))
  const [tapkey1, cblock1] = Tap.getPubKey(pubkey, { target: leaf1 })
  const address1 = Address.p2tr.encode(tapkey1, 'testnet')

  console.log('----------------------------------')
  console.log('leaf1: ' + leaf1)
  console.log('tpubkey1: ' + tapkey1)
  console.log('cblock1: ' + cblock1)
  console.log('address1: ' + address1)
}

export function createScript(file: { hex?: string; text?: string; mimetype: string }, pubkey: PublicKey) {
  // const ec = new TextEncoder()
  // const marker   = hexToBytes('ord')
  // const data = hexToBytes(file.hex)
  // const mimetype = ec.encode(file.mimetype)
  const marker = Buff.encode('ord')
  const data = file.hex ? hexToBytes(file.hex) : Buff.encode(file.text??'')
  const mimetype = Buff.encode(file.mimetype)

  const script = [pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', data, 'OP_ENDIF']
  return [script]
}

export async function createTempFundingAddress(file: { hex?: string; text?: string; mimetype: string }) {
  console.log('----------------------------------')
  console.log('createTempFundingAddress')
  console.log('file', file)
  // const privkey = bytesToHex(secp.utils.randomPrivateKey())
  const privkey = privateKey // '109c53777e185f6ebebe0a77128ec4f7a871030bef81836b212f3ce6106541ea' //'1abeb60666683a3db796b5d64afa229d16025b2cf512573129ddfa87d4847c36' //'97664508676c110ff75f3b42cb128ecd8d6fd25a6e7be5779659419b36fe8a0f'
  const seckey = new SecretKey(privkey, { type: 'taproot' })
  const pubkey = seckey.pub

  // const script = [pubkey, 'OP_CHECKSIG']
  const [script] = createScript(file, pubkey)

  // const script_backup = ['0x' + buf2hex(pubkey.buffer), 'OP_CHECKSIG']

  const leaf = Tap.tree.getLeaf(Script.encode(script))
  const [tapkey, cblock] = Tap.getPubKey(pubkey, { target: leaf })
  const fundingAddress = Address.p2tr.encode(tapkey, 'testnet')

  console.log('privkey', privkey)
  console.log('pubkey', pubkey.hex)
  console.log('script', script)
  console.log('leaf', leaf)
  console.log('tapkey', tapkey)
  console.log('cblock', cblock)
  console.log('fundingAddress', fundingAddress)

  return [fundingAddress, tapkey]
}

testAddress()
createTempFundingAddress({
  hex: '52494646d60d00005745425056503820ca0d00007094009d012a400240023e6d349647242322212a9d2818800d89636ee171ce00fe01f82ff855b60792fe13f683f65bf967102d3bec6368bf473fcfe90e487c63f807f04fc1afda3ff15eb3feb9fc83f003f603fa4f5007f00fe09f831fb25fe436fff67ff3407e01fc13f09bfa25e7b609da3f8ffe4c7effffdcf4cd807c87f22feb3fb11fd97f75bd01330fd17fa67e7afee1fb93dffcff77677c1bfc03f0ebf667f3f7bfc169644444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444444439d3aa4019125d1adb3a035bead7b10a42222222222222222221cd5a5ffc3243275e1a4b71cc2655940877ae02b87a02c1848d0e91567e13674e9b908888888888873569853ecd3e56c6d31e1a178984a6c1eb07221fac7b558bed6f8d2816e7ea4d98f255555555555555555444f75cdd4d57c84697157a83bce991c34c0bc1678f3bf4d97b144ab904444444444444403eef7c3c5ec20d79332e3e5854191c094f43975390c145091ab32555555555555555444fdaa9dd8ddb2610bb67dbc0eb9291302ac8c92c02ef8327cccccccccccccc1144f01383ddbfb3588a111dd88883fccbaefc423ac275d3a6e42221d4569273b766ba7da825bc92559213ffbebdf5ebb29fd25f04f06d22c9f330dd4fc423d925f982f660cf9923480d959a81744d5b3574e8acc3bcc2a91480ae18761484443b4f0df1f2e3a01fa25d8158b2fade27539ddfd629dcb181ce8d27d8559a86c6b49693a07e1dccaa01f08e8d384104441c7adcb24bf0696657577cace553ebef036d41de69dea76cf52dc843c27b4d22f20a3a54f1cfa36fbb4a10ee9017199fc83dcabee4de6764b943b1adeea57da12684eba691ee12f382efc66904eec7dbb6defafd9644443952260132a81afde31970e81f832730e56ac7757956b0c934dac927e744a4209dfe5217e0ebe03077ee2833333332b299fed0274e1d61063b06d3bcb0ac7f30d0748b21ea7c52ff4e8e185a1b842836a04131d9d2a993e6666666666661595d875d04d2bad7b24bef8999dc9920d6ba81f9555555555549c4ba0043cdf108888888876a945e8793874dc8444444443ba458790888888887929cdc47ff416d5438bc171ac2908888888887a5bead0d0e5afb5022222222080056ff1fca1aa0d00a3c275d36de196f3e310dd09d74e9b9088784d3d134a2bf36771583d766e06985f8963fe6bc297b24bf3333332fb81625f99e958ca7e8976a0ad9701f89863b86d86ea63eeb5ec92fccccc17baa7aafabeb904de7ce2a5d6bb2ff708666ca602e81f955555554772bab35bcffa34140eca435bad725455f8a86b40964fb1a62ccccccccccccc234ae379b497ea01ef452c3daeb383c99621361735ee46d40888888807dddbe248c435bb25e9eef8f0aa71b0d0fe634b2529379514ab3b0c0d11d74e9b9088784ea054953af2b227861e2a8f502c4fd61ebc07d6372090997cfac275cd800fdc4c7cdc70adc3c583532282482000003c202000000000000000000000000000000000000000000000000000000e2d634edca51388467578a3988538db7d0f6c00c55b00088e68dee08c9e97f99e47d0e0418515452696623293d874d9868ac4dcb48f59378806b937fc0488ca9265da1e466e7c2791d155008b5dc74b0e8837d10b0e7272dc11535d7313cdd95565d7a2e108e7bc3e5663b50a2851462b89b2ca6158005def4eb5d13588686dba2f56664b07406de5ad4d056d0cf17ed28d9d4192cf0b26545e39fe51c6b0964668646b667618ce59e1c7366267f3e8c27a856b1313a236ced9e47697a0b4dfbe36002239dfcd31a10ce58f9ada0ed723f0e9052a73c9664f9deadd60f9621c859b3ad340f48c85750af0cd7aaf75389d02d9b4090013669ff6715dff5ce16a78962456a950bb73a871490d3d69ce26448fb3eb7e220d6cf39b6bb32002538e96a4d6230200f1aee7b2a829fd0f811a9fee651373dbabdfabf2925be2f5f943ccf13074853bfb197e266bbc63549e471dd43a30896e5dfd9ad2b32e8a0be0f01c9e9e2fe1898e010a33cbd0715e2ad37e1fafdc3660d885356ed6227758a70af7d797d95ff52633e3a5a53aae733a4623a81b26bad9c57c31540137c4f49bd333cfcbe8262eaf8222d4a3fe4f7d038cccff76958bc0aa344846a8e41141b68d81cdda22916ab626c75cc6e68bd4b1d2be5ddc98c6d9cefd9a2e6494df82d60672c195196102008ae0b39b96595e33bac421bd5949eca9ba73a23eaa697bb0cc02008da2eae436fc6391764d5b258b6ff7faa309002fca19a0fad4f8ac37d975ae73ad702968bc82f9b46cf2f9dc3f2ed0dcb32b96186c70539e0b3b583e70054011fda1b998a60e7a9b05e8a79274f7fdc326c4c258802b49e04bbbfc26d2b3134922b03fd8115d0582b6e121b5032368a7c692bbc8c4467ec58a09fe93f1472484f78b4842f16746d8d79d878b8fff439ed0c531c30e2c513eb5d9ade55b33766a4bcf84d69174efafd937024dbe4881aca652a63cd878a4ed3d7882616501f0436a39a9e22eb044e48e96902e81e4b388c302038166cec276e9bb200051f6548aaec2c24fdfa021fa71df5cdbb4a4742a0ff5daf48acf2e63993a1bf5141b4b35707a16561bfb671c30b31c25c6d615968b868278b6237312f48d8866b39898aca05815c3c34f81816692357c83ab615a42c610b419ff2e9bb73bfce2e908032342c9fc899c650d9e463dcbc60c1786b9e2836291491a03546fc30988d2d20a7bbd8324a87a7c4947d8e4835653f762182425e6882a3eb4e165bcb9078d6c949820f9541723a6792db30b6ea86859d374e8d8c5650f88c9149e2529237e78f9f3efa5de059909ca187420a3f9b9a38c6d58ed85d8998dadfd7a4dfced2779232395bee4a808bdab7c488632381129ae35ce80771ce1ba9e460a0657ee48b116c992570f68ff49637bf3cecdf0e2bb0b0b90d0cabd72f53e6bcb6c440c7324e1cc0e2ef99a341acd6138c7f5fd1e629596672f706171b20001ae7b04a603c232f8e6ad1b17749ddac14f0ff985d87d903c5bfb6435d88f3d80f0a6c004ec3e7c0802ce634975a4f349a41053c007bb4a211fb373edea0adb405c279d1ba42f79d1dec454df146c005e9450e5f81ef60afb9a74a69aec689d826d3b2627d3d4f3e901d193c3626f6b77ae4ab363c7c92e6ee53f74920f3e876bf012b9c9f63715607c254a93b6be737199a202c37a75ae7cc41a6e30ea779c48a816d56f7126f6f7fef733bddf2b3e953a14606a63528070d1425f2ffb839f18e83fc7eb9ad61623e86a5d3651669b89a020df45ab20f9411669b89a020df4606c33a8bc2612bbc97133d11ffb4ea9dcbf6b616f296a9a6e9c85ece1e99e79b56e746354fb034ad8203b372077d4f6336c94381585610e37c330a7302542a5f3bc825ece909c099cacd4250c2c85c32f55da6a0000000ffad3f6a833180aadc2d6b328f8eb97b9b385369ddfa0fb8a876ad16e1b098495d2e749fd6cb5ea6157de553d2cdc3f2c27c01960eb345bb7bd7b03405d21000000e37c5327450340978f3ac1f06d0b0400c91fd0c35d7edc00df6e2044dff0b1962c8d0b002257693581ca8d19652238d636736296d607083b78c41b022e7dd6dfdb0c99fcb10f5f843d8b2b6e42003c7f4b7fff2dec48b00c5add50a19336b299d64099b63ba47d78006ce7d3959d4258f3a4eb448d5c1fb81f1354007ab3df9f043593b0d8e35a39e6e59922a21309980238a9a2098fe08640fd60b86e7efd6542bad2afe325e056e133c0ce3212002dd618252be125516365685724ef9bb05cfe05fc921ee071cbdd7ffefbd5aa8bcff2c863f2dcec2bc1ce893f978b8a8e54b95f7aa5eb4f5944b93bfd59eb3a23df8c606b89138d6066e8d572c84a8381005b526bb738aee76d98ed162ce6456000e9fc0fbd515d4584a23bb34f4c0f785803537a1ba4fa479ce89f4015628d957e8dde4477ce34b197773662803e389a64b2f607935ab3bd70dca9b57d199413905db0ee927dc52f16044b375f9f26ac956384be0ec3eae4711ca767b0b832e379040827f8526a4cb97913371c6d210550a34da161839d1445f7a092792367a2a1359c2c5521f35f47b15839d2955f88bc6afe1e5729ee8fcd6d5cced8121be21bb614df5fee010b70b217c4fbc054d7edc6a17d69dda678cb17a44abadc42d13719f7a76547a5fade85a2643e210cb0a23ab0fae81e8e3b9d6f8889e0edbf1707c9e023c89cb6deba1a0b8baf5ae6eb7f67e5857d6b784bd39ac1261af81dcf920ab66ada0b0c5a2cb0339f3d717bc84598a403632c4a80b2cba6d03312c303cfc2dbed1a1e703fb6503fb890ca28ceb84c43258e0797dd1b8349efa94afaf7850a3762da614a806ff9d7c0e4fbf1748106ecc35088fb3a9894bb9943a5fb241862d66c995c6e451cbf42061fe3640b356468808498b41e7d97d7345804a6a8124b26724bd63996b72042ff4df0467362aeb191a6c0c581699157e50468aa3eb02da894803c20efdd4309ebb7b08dad379095a893ba8f3a172a3751f3c22c06082a3ba0b5abde935d9da04936203608cb439eee0d6a9f19334d9cd425c218de880129c74b52630c144e7c2fc77def44eae0017fee337746766c5fd2d16e318ac2f1e704d39038e084313d1cacea97fbbcc2b9121f56e6a42d804121e196763b3a77457e8ec8e336db5421ce6c008e940000e89a2df249bafc3b5a83023bfdcf1e1d132786dd38ad285b020000000',
  mimetype: 'image/webp'
})

// createTempFundingAddress({
//   // text:'7b2270223a226272632d3230222c226f70223a226465706c6f79222c227469636b223a2279796473616263222c226d6178223a22323130303030222c226c696d223a22313030222c22646563223a223138227d',
//   // text: '{"p":"brc-20","op":"deploy","tick":"yydsabc","max":"210000","lim":"100","dec":"18"}',
//   text: '{"p":"brc-20","op":"deploy","tick":"yydsfs","max":"2100000","lim":"100","dec":"18"}',
//   // text:'{"p":"brc-20","op":"mint","tick":"abcd","amt":"1000"}',
//   mimetype: 'text/plain;charset=utf-8'
// })