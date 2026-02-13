import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api/api";
import ProductGrid from "../../components/ProductGrid";
import Pagination from "../../components/Pagination";

const SellerProductsByCategory = () => {
    const { name } = useParams();
    const [products, setProducts] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            const res = await api(`/product/getBySellerCategory/${name}?page=${page}`, "GET");

            if (!res.success) return;

            // setProducts(res.data?.page_data || []);
            setProducts(res.data.page_data);
            setPageInfo(res.data.page_information);
        };

        fetchCategoryProducts();
    }, [name, page]);

    return (
        <div className="flex min-h-screen flex-col px-6 py-6 lg:px-8 bg-slate-50">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
                Category: {name}
            </h2>


            <ProductGrid products={products} />
            <Pagination
                pageInfo={pageInfo}
                onPageChange={(newPage) => setPage(newPage)}
            />
        </div>
    );

};

export default SellerProductsByCategory;