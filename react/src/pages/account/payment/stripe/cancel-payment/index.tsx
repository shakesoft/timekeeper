import L from "@/lib/L";
import React from "react";

const StripeCancelPaymentPage: React.FC = () => {
  return (
    <div
      className="d-flex h-100 align-items-center"
      style={{ paddingBottom: "150px" }}
    >
      <div className="login-form align-middle m-0 text-center w-100">
        <div className="d-flex align-items-center justify-content-center flex-column h-100 w-100">
          <div className="mb-5">
            &emsp;
            <i
              className="fas fa-times text-danger"
              style={{ fontSize: "5rem" }}
            />
          </div>
          <h3 className="fw-bolder text-gray-900 fs-4 fs-1-lg">
            {L("PaymentCouldNotCompleted")}
          </h3>
          <a
            className="btn btn-info mt-5"
            href="/app/admin/subscription-management"
          >
            {L("GoToSubscriptionManagement")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default StripeCancelPaymentPage;
