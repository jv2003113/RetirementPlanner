import React from "react";
import { cn } from "@/lib/utils";
import logoSrc from "@/assets/logo.png";

interface ERLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    className?: string;
}

export const ERLogo = ({ className, alt = "Retire Easy Logo", ...props }: ERLogoProps) => {
    return (
        <img
            src={logoSrc}
            alt={alt}
            className={cn("object-contain", className)}
            {...props}
        />
    );
};
