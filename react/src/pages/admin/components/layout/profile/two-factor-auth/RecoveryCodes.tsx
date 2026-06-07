import React from "react";
import L from "@/lib/L";

type Props = { codes: string[] };

const RecoveryCodes: React.FC<Props> = ({ codes }) => {
  return (
    <div>
      <h3 className="card-label">{L("SaveRecoveryCodesTitle")}</h3>
      <div className="bg-light p-5" id="recoveryCodes">
        <div className="row">
          {(codes || []).map((code) => (
            <div key={code} className="text-gray-900 fs-6 fw-bold col-6">
              {code}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecoveryCodes;
