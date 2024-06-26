import {Fragment, useEffect, useState} from 'react'
import {Dialog, Transition} from '@headlessui/react'
import {XMarkIcon} from '@heroicons/react/24/outline'
import {CiShop} from "react-icons/ci";
import Loader from "@/components/Loader";
import Image from "next/image";
import Link from "next/link";
import {message} from "antd";
import ICartItem from "@/types/CartItem";


export default function Cart() {
  const [open, setOpen] = useState(true)
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading && cartItems) return;
    fetch(process.env.NEXT_PUBLIC_BACKEND_HOST + "/cart", {
      method: "GET",
      headers: {"Content-Type": "application/json",},
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        setCartItems(data.cartItems);
        setLoading(false);
    })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  const handleRemove = (cartItemId: string) => {
    fetch(process.env.NEXT_PUBLIC_BACKEND_HOST + `/cart/${cartItemId}`, {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete product");
        }
        message.open({
          type:'success',
          content: 'Product removed from cart',
          duration: 2
        });
        //@ts-ignore
        setCartItems(cartItems.filter((cartItem) => cartItem.id !== cartItemId));
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  let totalCost = 0;

  if (loading) {
    return <Loader/>
  }
  if (cartItems?.length > 0) {
    totalCost = cartItems?.reduce((acc, cartItem) => acc + cartItem.quantity * cartItem.product.price, 0);
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">

          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">

              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full">

                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/*Cart header and body*/}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      {/*Title and x button*/}
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">Shopping cart</Dialog.Title>

                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>

                      </div>
                      {/*Cart items*/}
                      {loading ? <Loader />:
                      <div className="mt-8">
                        {cartItems?.length === 0 ?
                          <p className="text-black-2 text-center">It looks like you don't have any items in your
                            cart</p> :
                        <div className="flow-root">
                          {cartItems?.map(cartItem =>
                            <ul className="bg-gray-100 mb-5 p-4 pb-6 shadow-md rounded-" key={cartItem.id}>
                            <div className="flex items-center gap-1 mb-2">
                              <CiShop />
                              <p className="font-semibold"> Shop: {cartItem.product.displayName} </p>
                            </div>
                            <ul role="list" className="-my-6 divide-y divide-gray-200">
                              <li  className="flex py-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <Image
                                    width={50}
                                    height={50}
                                    alt={cartItem.product.id}
                                    src={cartItem.product.productImages[0].url}
                                    className="h-full w-full object-cover object-center"/>
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>
                                        <Link
                                          href={`/product/${cartItem.product.id}`}>{cartItem.product.displayName}</Link>
                                      </h3>
                                      <p className="ml-4">${cartItem.product.price}</p>
                                    </div>
                                  </div>

                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <p className="text-gray-500">Qty {cartItem.quantity}</p>

                                    <div className="flex">
                                      <button
                                        type="button"
                                        onClick={() => handleRemove(cartItem.id)}
                                        className="font-medium text-red-800 hover:text-black">
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </li>

                              {/*Order subtotal*/}
                              <div className="flex justify-end items-center gap-3 pt-4 mb-2">
                                <p className="font-semibold"> Order total: </p>
                                <p className="text-lg font-semibold"> ${cartItem.quantity * cartItem.product.price}</p>
                              </div>
                            </ul>
                          </ul>
                        )}
                        </div>}
                      </div>
                      }
                    </div>

                    {/*Cart footer*/}
                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                      {/*Subtotal*/}
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>{totalCost} $</p>
                      </div>

                      <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                      {/*Checkout page*/}
                      <div className="mt-6">
                        <Link
                          href="/user/checkout"
                          className="flex items-center justify-center rounded-md border border-transparent bg-black px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-600"
                        >
                          Checkout
                        </Link>
                      </div>
                      {/*Continue shopping*/}
                      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                          or{' '}
                          <button
                            type="button"
                            className="font-medium text-black hover:text-gray-500"
                            onClick={() => setOpen(false)}
                          >
                            Continue Shopping
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>


              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}