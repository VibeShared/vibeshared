"use client";

interface TipButtonProps {
  creatorName: string;
  buyMeACoffeeLink: string;
}

export default function TipButton({
  creatorName,
  buyMeACoffeeLink,
}: TipButtonProps) {
  return (
    <button
      className="btn btn-link p-0 mb-5"
      title={`Tip ${creatorName}`}
      onClick={() => window.open(buyMeACoffeeLink, "_blank")}
    >
      <i className="bi bi-currency-dollar fs-3 text-warning"></i>
    </button>
  );
}
