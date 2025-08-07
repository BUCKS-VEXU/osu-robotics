/* Noah Klein */

import { useEffect } from "react";

const Redirect = ({ href }: { href: string }) => {
    useEffect(() => {
        window.location.replace(href);
    });
    return null;
};

export default Redirect