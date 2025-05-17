import { ExternalLink } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className="text-sm text-center text-muted-foreground my-5">
      <p>
        &copy; 2025 Split Karo. All rights reserved.
        <a
          href="https://github.com/karthikeya0800/SplitKaro"
          target="_blank"
          rel="noopener noreferrer"
          className="text-expense hover:underline font-medium inline-flex items-center ml-2"
        >
          GitHub <ExternalLink size={16} className="ml-1" />
        </a>
      </p>
    </footer>
  );
};

export default Footer;
