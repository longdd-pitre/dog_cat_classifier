import '@/styles/globals.css'
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import { Roboto } from 'next/font/google'
import { useEffect } from "react";

const roboto = Roboto({
  weight:'400',
  subsets:['latin'],
})
export default function MyApp({ Component, pageProps }) {

  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  return (
    <main className={roboto.className}>
        <Component {...pageProps} />
    </main> 
  )

}
