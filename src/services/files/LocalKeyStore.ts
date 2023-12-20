import { KeyInfo } from '@types'
import fs from 'fs/promises'

const dataFilePath = `${process.cwd()}/data/keystore.json`
// console.log('process.cwd()', process.cwd())
// console.log('__dirname', __dirname)

class LocalKeyStore {
  private static async readKeyInfos(): Promise<KeyInfo[]> {
    try {
      const data = await fs.readFile(dataFilePath, 'utf8').catch((error) => {
        console.error('readFile error', dataFilePath, error)
      })
      if (data) {
        const keyInfos: KeyInfo[] = JSON.parse(data)
        return keyInfos
      }
    } catch (error) {
      console.error('load keystore fail:', error)
    }

    return []
  }

  static async findKeyInfoByAddress(address: string): Promise<KeyInfo | undefined> {
    const keyInfos = await LocalKeyStore.readKeyInfos()
    const keyInfo = keyInfos.find((o) => o.address === address)
    return keyInfo
  }

  static async writeKeyInfo(keyInfo: KeyInfo): Promise<void> {
    const keyInfos = await LocalKeyStore.readKeyInfos()
    keyInfos.push(keyInfo)
    await fs.writeFile(dataFilePath, JSON.stringify(keyInfos), 'utf8')
  }
}

export default LocalKeyStore
