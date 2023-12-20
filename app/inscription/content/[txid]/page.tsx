import IFrame from '@components/IFrame'
import { getInscriptionContentUrl } from '@services/rest/api'

export default async function Page({
  params
}: // searchParams
{
  params: { txid: string }
  // searchParams: { [key: string]: string | undefined }
}) {
  const { txid } = params
  // const { mimetype } = searchParams

  return (
    <section className="relative mx-8 my-20 flex min-h-[200px] items-center justify-center">
      <IFrame objectFit='contain' src={getInscriptionContentUrl(txid)} className="w-full" />
    </section>
  )
}
