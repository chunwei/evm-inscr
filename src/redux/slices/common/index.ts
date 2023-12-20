import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IOrder } from '@types';


interface ICommon {
  curOrder?: IOrder
  newOrderCount: number
  receiveAddresses: string[]
  parentLocation?: Record<string, string>
}

const initialState: ICommon = {
  curOrder: undefined,
  newOrderCount: 0,
  receiveAddresses: [],
  parentLocation: {}
}

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setCurOrder: (state, action: PayloadAction<IOrder>) => {
      state.curOrder = action.payload
    },
    clearCurOrder: (state) => {
      state.curOrder = undefined
    },
    increaseNewOrderCount: (state) => {
      state.newOrderCount++
    },
    addReceiveAddress: (state, action: PayloadAction<string>) => {
      if (!state.receiveAddresses.includes(action.payload)) state.receiveAddresses.push(action.payload)
    },
    setReceiveAddresses: (state, action: PayloadAction<string[]>) => {
      state.receiveAddresses = action.payload
    },
    setParentLocation: (state, action: PayloadAction<Record<string, string>>) => {
      state.parentLocation = action.payload
    }
  }
})

export const {
  setCurOrder,
  clearCurOrder,
  increaseNewOrderCount,
  addReceiveAddress,
  setReceiveAddresses,
  setParentLocation
} = commonSlice.actions

export default commonSlice.reducer