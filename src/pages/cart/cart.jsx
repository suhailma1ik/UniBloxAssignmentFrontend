import React, { useContext, useState } from "react";
import { ShopContext } from "../../context/shop-context";
import { PRODUCTS } from "../../products";
import { CartItem } from "./cart-item";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./cart.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
const baseurl = "http://127.0.0.1:8000/api/store/";
export const Cart = () => {
  const { cartItems, getTotalCartAmount, checkout } = useContext(ShopContext);
  const [totalAmount, setTotalAmount] = useState(getTotalCartAmount());
  const [couponCode, setCouponCode] = useState("");
  const orderNumber = localStorage.getItem("orderNumber") || 1;
  const navigate = useNavigate();
  // console.log(cartItems);
  const numberOfItems = Object.values(cartItems).reduce(
    (acc, item) => acc + item
  );
  const getCouponCode = () => {
    axios.get(baseurl + "discounts/" + orderNumber).then((res) => {
      setCouponCode(res.data.code);
    });
  };

  const checkCouponCode = (code) => {
    axios
      .post(baseurl + "applyDiscount/", {
        coupon: code,
        numberOfItems: numberOfItems,
        amount: totalAmount,
      })
      .then((res) => {
        if (res.data.status === "Coupon applied")
          toast.success(res.data.status);
        else {
          toast.error(res.data.status);
          return;
        }
        setTotalAmount(totalAmount - res.data.discount);
      });
  };

  return (
    <div className='cart'>
      <ToastContainer />
      <div>
        <h1>Your Cart Items</h1>
        {orderNumber % 3 === 0 && (
          <div>
            <h2>Get 10% discount on this order</h2>
            {couponCode === "" ? (
              <button
                onClick={() => {
                  getCouponCode();
                }}
                className='button'
              >
                get Coupon Code
              </button>
            ) : null}
            {couponCode}
          </div>
        )}
      </div>
      <div className='cart'>
        {PRODUCTS.map((product) => {
          if (cartItems[product.id] !== 0) {
            return <CartItem data={product} />;
          }
        })}
      </div>

      {totalAmount > 0 ? (
        <div className='checkout'>
          <p> Subtotal: ${totalAmount} </p>
          {orderNumber % 3 === 0 && <input placeholder='Enter Coupon Code' />}
          <div>
            <button onClick={() => checkCouponCode(couponCode)}>
              Apply coupon
            </button>
            <button onClick={() => navigate("/")}> Continue Shopping </button>
            <button
              onClick={() => {
                toast.success("Order Placed successfully");
                checkout(orderNumber);
                navigate("/");
              }}
            >
              {" "}
              Checkout{" "}
            </button>
          </div>
        </div>
      ) : (
        <h1> Your Shopping Cart is Empty</h1>
      )}
    </div>
  );
};
