import { instance } from "../app.js";
import crypto from 'crypto'

export const paymentController = async (req, res) => {
    const { total_amount } = req.body
    try {

        const options = {
            amount: Number(total_amount * 100),
            currency: "INR"
        }

        const order = await instance.orders.create(options)
        res.status(200).json({
            success: true,
            message: "Payment order created",
            order
        })
    } catch (e) {
        return res.status(404).json({
            success: false,
            message: "Server Error",
            e
        })
    }
}

export const getKey = async (req, res) => {
    try {
        const key = process.env.RAZORPAY_API_KEY
        // console.log(process.env.RAZORPAY_API_KEY)
        return res.status(200).json({
            success: true,
            key: key
        })
    } catch (error) {
        console.log(error)
        return res.status(404).json({
            success: false,
            message: "Server Error",
            error
        })
    }
}


export const paymentVerificationController=async(req,res)=>{
    const {razorpay_payment_id,razorpay_order_id,razorpay_signature}=req.body
    const body=razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature=crypto.createHmac("sha256",process.env.RAZORPAY_API_SECRET).update(body.toString()).digest("hex")
    const isAuthenticate=expectedSignature===razorpay_signature
    if (isAuthenticate){
        return res.redirect(`http://localhost:5173/paymentSuccess?reference=${razorpay_payment_id}`)
    }
    else{
        res.status(400).json({
            success:false,
            message:"Payment Unsuccessfull"
        })
    }

}

export const paymentVerificationControllerCart=async(req,res)=>{
    const {razorpay_payment_id,razorpay_order_id,razorpay_signature}=req.body
    const body=razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature=crypto.createHmac("sha256",process.env.RAZORPAY_API_SECRET).update(body.toString()).digest("hex")
    const isAuthenticate=expectedSignature===razorpay_signature
    if (isAuthenticate){
        return res.redirect(`http://localhost:5173/paymentSuccessCart?reference=${razorpay_payment_id}`)
    }
    else{
        res.status(400).json({
            success:false,
            message:"Payment Unsuccessfull"
        })
    }

}