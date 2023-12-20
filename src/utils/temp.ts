export {}
// export function createScript(file:IFile, pubkey:PublicKey) {
// 	const marker   = Buff.encode('ord')
// 	const data = Buff.encode(file.hex)
// 	const mimetype = Buff.encode(file.mimetype)

// 	const script = [pubkey, 'OP_CHECKSIG', 'OP_0', 'OP_IF', marker, '01', mimetype, 'OP_0', data, 'OP_ENDIF']
// 	return [script]
// }

// export async function createTempFundingAddress(file:IFile):[string,string] {
// 	// const privkey = '1abeb60666683a3db796b5d64afa229d16025b2cf512573129ddfa87d4847c36'
// 	const privkey = bytesToHex(secp.utils.randomPrivateKey())
// 	const seckey = new SecretKey(privkey, { type: 'taproot' })
//     const pubkey = seckey.pub
// 	const [script] = createScript(file, pubkey)

// 	const leaf = Tap.tree.getLeaf(Script.encode(script))
// 	const [tapkey, cblock] = Tap.getPubKey(pubkey, { target: leaf })
// 	const address = Address.p2tr.encode(tapkey, encodedAddressPrefix)

// 	return [address, pubkey.hex]
// }
