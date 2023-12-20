import { IOrder } from '@types';
import fs from 'fs/promises'

type Order = IOrder

const dataFilePath = `${process.cwd()}/data/orderdb.json`

// console.log('process.cwd()', process.cwd())
// console.log('__dirname', __dirname)

class OrderManager {
  static async readOrders(): Promise<Order[]> {
    const data = await fs.readFile(dataFilePath, 'utf8')
    if (data) {
      try {
        const orders: Order[] = JSON.parse(data)
        return orders
      } catch (error) {
        console.error(error)
      }
    }

    return []
  }

  static async findOrderById(orderId: string): Promise<Order | undefined> {
    const orders = await OrderManager.readOrders()
    const order = orders.find((o) => o.orderId === orderId)
    return order
  }

  static async writeOrder(order: Order): Promise<void> {
    const orders = await OrderManager.readOrders()
    orders.push(order)
    await fs.writeFile(dataFilePath, JSON.stringify(orders), 'utf8')
  }
}

export default OrderManager

/* 
// 示例用法
const orderToWrite: Order = {
	orderId: '123'
	// 其他字段
}

OrderManager.writeOrder(orderToWrite)

const orderIdToFind = '123'
const foundOrder = OrderManager.findOrderByOrderId(orderIdToFind)
if (foundOrder) {
	console.log('找到订单：', foundOrder)
} else {
	console.log('未找到该订单。')
}
 */