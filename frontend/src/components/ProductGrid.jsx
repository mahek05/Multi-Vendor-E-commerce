import ProductCard from "./ProductCard";

const ProductGrid = ({ products = [] }) => {
    if (!products.length) {
        return (
            <p className="text-center text-slate-900">
                No products found
            </p>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default ProductGrid;