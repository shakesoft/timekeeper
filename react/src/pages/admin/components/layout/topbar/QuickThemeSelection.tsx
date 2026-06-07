import React from "react";

type Props = {
  className?: string;
  onOpen?: () => void;
};

const QuickThemeSelection: React.FC<Props> = ({ className, onOpen }) => {
  return (
    <div
      id="kt_explore_toggle"
      className="d-flex align-items-center ms-1 ms-lg-3"
    >
      <div
        className={
          className ||
          "btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px position-relative"
        }
        onClick={onOpen}
      >
        <i className="flaticon-interface-7 fs-4" />
      </div>
    </div>
  );
};

export default QuickThemeSelection;
