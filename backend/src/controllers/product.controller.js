const Product = require("../models/product.model");
const Category = require("../models/category.model");
const response = require("../helpers")
const {
    getPaginationMetadata,
    getPaginatedResponse
} = require("../helpers/pagination");

exports.createProduct = async (req, res) => {
    // try {
    //     const productData = { ...req.body };

    //     if (req.file) {
    //         productData.image = `/uploads/${req.file.filename}`;
    //     }

    //     const product = await Product.create(productData);

    //     res.status(201).json(product);
    // } catch (error) {
    //     console.error("CREATE PRODUCT ERROR:", error);
    //     res.status(500).json({ message: "Server error" });
    // }

    try {
        const { product_name, description, price, stock, image, category_id } = req.body;
        const seller_id = req.sellerId;

        await Product.create({
            product_name,
            description,
            image,
            category_id,
            price,
            stock,
            seller_id
        });
        return response.success(res, 3001, null, 201);
    } catch (error) {
        console.error(error);
        return response.error(res, 9999);
    }
};

exports.updateProduct = async (req, res) => {
    // try {
    //     const updateData = { ...req.body };

    //     if (req.file) {
    //         updateData.image = `/uploads/${req.file.filename}`;
    //     }

    //     const product = await Product.findOneAndUpdate(
    //         { _id: req.params.id, deletedAt: null },
    //         updateData,
    //         { new: true }
    //     );

    //     if (!product) {
    //         return res.status(404).json({ message: "Product not found" });
    //     }

    //     res.json(product);
    // } catch (error) {
    //     console.error("UPDATE PRODUCT ERROR:", error);
    //     res.status(500).json({ message: "Server error" });
    // }

    try {
        const { product_name, description, price, stock, image, category_id } = req.body;

        const { id } = req.params;

        const product = await Category.findOne({
            where: {
                id,
                is_deleted: false,
            },
        });

        if (!product) {
            return response.error(res, 3002, 404);
        }

        await product.update({
            product_name: product_name ?? product.product_name,
            description: description ?? product.description,
            price: price ?? product.price,
            stock: stock ?? product.stock,
            image: image ?? product.image,
            category_id: category_id ?? product.category_id
        });

        return response.success(res, 3003, product, 200);
    } catch (error) {
        console.error("Error:", error);
        return response.error(res, 9999);
    }
};

exports.deleteProduct = async (req, res) => {
    // try {
    //     const product = await Product.findOneAndUpdate(
    //         { _id: req.params.id, deletedAt: null },
    //         { deletedAt: new Date() },
    //         { new: true }
    //     );

    //     if (!product) {
    //         return res.status(404).json({ message: "Product not found" });
    //     }

    //     res.json({ message: "Product deleted successfully" });
    // } catch (error) {
    //     console.error("UPDATE PRODUCT ERROR:", error);
    //     res.status(500).json({ message: "Server error" });
    // }

    try {
        const { id } = req.params;

        const product = await Category.findOne({
            where: {
                id,
                is_deleted: false,
            },
        });

        if (!product) {
            return response.error(res, 3002, 404);
        }

        await product.update({ is_deleted: true });

        return response.success(res, 3004, null, 200);
    } catch (error) {
        console.error("Error:", error);
        return response.error(res, 9999);
    }
};

exports.getAllProducts = async (req, res) => {
    // try {
    //     const page = parseInt(req.query.page) || 1;
    //     const limit = 15;
    //     const skip = (page - 1) * limit;

    //     const products = await Product.find({ deletedAt: null })
    //         .skip(skip)
    //         .limit(limit);

    //     res.json(products);
    // } catch (err) {
    //     res.status(500).json({ message: "Server error" });
    // }

    try {
        const { page, limit, offset } = getPaginationMetadata(
            req.query.page,
            req.query.limit
        );

        const products = await Product.findAndCountAll({
            where: { is_deleted: false },
            limit,
            offset,
            order: [["created_at", "DESC"]],
        });

        const paginatedResponse = getPaginatedResponse(
            products,
            page,
            limit
        );

        return response.success(res, null, paginatedResponse, 200);
    } catch (error) {
        console.error("Error:", error);
        return response.error(res, 9999);
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Category.findOne({
            where: {
                id,
                is_deleted: false,
            },
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return response.success(res, null, product, 200);
    } catch (error) {
        console.error("Error:", error);
        return response.error(res, 9999);
    }
};

exports.getProductBySellerId = async (req, res) => {
    try {
        const { seller_id } = req.seller;

        const { page, limit, offset } = getPaginationMetadata(
            req.query.page,
            req.query.limit
        );

        const products = await Product.findAndCountAll({
            where: {
                seller_id,
                is_deleted: false,
            },
            limit,
            offset,
            order: [["created_at", "DESC"]],
        });

        const paginatedResponse = getPaginatedResponse(
            products,
            page,
            limit
        );

        return response.success(res, null, paginatedResponse, 200);
    } catch (error) {
        console.error("Error: ", error);
        return response.error(res, 9999)
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const { title, category } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const skip = (page - 1) * limit;

        const filter = { deletedAt: null };

        if (title) {
            filter.title = { $regex: title, $options: "i" };
        }

        if (category) {
            const categories = await Category.find({
                name: { $regex: category, $options: "i" },
                deletedAt: null
            }).select("_id");

            if (!categories.length) {
                return res.json([]);
            }

            const categoryIds = categories.map(c => c._id);
            filter.product_category_id = { $in: categoryIds };
        }

        const products = await Product.find(filter)
            .populate("product_category_id", "name")
            .skip(skip)
            .limit(limit);

        res.json(products);
    } catch (error) {
        console.error("SEARCH PRODUCTS ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// exports.searchProducts = async (req, res) => {
//   try {
//     const { title, category } = req.query;

//     const page = parseInt(req.query.page) || 1;
//     const limit = 15;
//     const skip = (page - 1) * limit;

//     const query = { deletedAt: null };

//     if (title) {
//       query.title = { $regex: title, $options: "i" };
//     }

//     if (category) {
//       const categories = await Category.find({
//         name: { $regex: category, $options: "i" },
//         deletedAt: null
//       }).select("_id");

//       const categoryIds = categories.map(c => c._id);

//       if (categoryIds.length) {
//         query.product_category_id = { $in: categoryIds };
//       } else {
//         return res.json([]);
//       }
//     }

//     const products = await Product.find(query)
//       .populate("product_category_id", "name")
//       .skip(skip)
//       .limit(limit);

//     res.json(products);
//   } catch (error) {
//     console.error("SEARCH PRODUCT ERROR:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
