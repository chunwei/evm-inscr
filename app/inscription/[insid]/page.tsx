import InscriptionCard from '@components/inscribe/Inscription'
import { queryInscription } from '@services/rest/api'
import { error } from 'console'

export default async function Page({
  params,
  searchParams
}: {
  params: { insid: string }
  searchParams: { [key: string]: string | undefined }
}) {
  const { insid } = params
  const inscription = await queryInscription(insid)

  return (
    <section className="relative mx-8 my-20 flex min-h-[200px] items-center justify-center">
      <InscriptionCard inscription={inscription} />
    </section>
  )
}
