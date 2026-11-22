import {MoonLoader} from "react-spinners";

export default function SubmitButton({ text, loading, ...rest }) {
    return (
        <button
        type="submit"
        className="bg-[#FFD84A] px-4 py-3 text-md font-bold flex items-center justify-center text-slate-950 transition hover:bg-[#e6c200] w-full"
        {...rest}
            >
              {loading ? <MoonLoader color="black" size={18} /> : text}
            </button>
    )
}