import categoryModel from "../models/category.model.js"
export const createCategoryController=async(req,res)=>{
    try {
        const { name } = req.body
        if (!name) {
            return res.status(401).send({
                message: 'Name is required'
            })
        }
        const existingCategory = await categoryModel.findOne({ name })
        if (existingCategory) {
            return res.status(202).send({
                success: false,
                message: 'Category Already Exists'
            })
        }
        const category = await new categoryModel({ name }).save()
        res.status(201).send({
            success: true,
            message: 'New Category created',
            category
        })
    }
    catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Category'
        })
    }
}