import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer bg-light" id="footer">
      <div className="container text-center py-3 footer-content">
        <span className="text-muted footer-text">
          © 2024 Acme Corp. All rights reserved. Version: 1.2.3 <br />
          Created by Roy & Itay
        </span>
      </div>
    </footer>
  );
};

export default Footer;
