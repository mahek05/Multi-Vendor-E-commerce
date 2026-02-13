const Info = ({ label, value }) => (
    <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 font-medium text-slate-900 break-words">
            {value || "—"}
        </p>
    </div>
);

export default Info;