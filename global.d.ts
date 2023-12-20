/*
 * @Author: Chunwei Lu
 * @Date: 2023-05-09 23:32:29
 * @LastEditTime: 2023-05-12 15:15:39
 * @LastEditors: luchunwei luchunwei@gmail.com
 */
// Declaring this interface provides type safety for message keys
type Messages = typeof import('./messages/en-US.json')
type IntlMessages = Messages

type Nullable<T> = T | null

declare interface IStepNav {
  stepNavFns?: { next?: () => void; prev?: () => void; go?: (n: number) => void }
}
