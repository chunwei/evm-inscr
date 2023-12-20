import { User } from '@types'

export async function getUsers() {
  const res = await fetch('https://jsonplaceholder.typicode.com/users')
  const users = (await res.json()) as User[]
  return users
}
