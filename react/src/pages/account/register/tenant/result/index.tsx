import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import tenantRegistrationHelper, {
  RegisterTenantResult,
} from "../../tenant-registration-helper";
import AppConsts from "../../../../../lib/app-consts";
import L from "@/lib/L";

const RegisterTenantResultPage: React.FC = () => {
  const navigate = useNavigate();
  const [model, setModel] = useState<RegisterTenantResult>(null);

  useEffect(() => {
    const res = tenantRegistrationHelper.get();
    if (!res) {
      navigate("/account/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModel(res);
  }, [navigate]);

  const tenantUrl = useMemo(() => {
    const tname = model?.tenancyName;
    if (!tname) return "";
    const base = AppConsts.appBaseUrl;
    try {
      const u = new URL(base);
      const hostParts = u.hostname.split(".");
      if (hostParts.length > 1) {
        u.hostname = `${tname}.${hostParts.slice(-2).join(".")}`;
        return u.toString();
      }
      return `${base}/t/${encodeURIComponent(tname)}`;
    } catch {
      return base;
    }
  }, [model]);

  if (!model) return null;

  return (
    <div className="login-form">
      <h4>{L("SuccessfullyRegistered")}</h4>

      <ul>
        <li>
          <span className="text-muted">{L("TenancyName")}:</span>{" "}
          {model.tenancyName}
        </li>
        <li>
          <span className="text-muted">{L("Name")}:</span> {model.name}
        </li>
        <li>
          <span className="text-muted">{L("UserName")}:</span> {model.userName}
        </li>
        <li>
          <span className="text-muted">{L("EmailAddress")} :</span>{" "}
          {model.emailAddress}
        </li>
      </ul>

      <div>
        {model.isEmailConfirmationRequired && (
          <div className="alert alert-warning" role="alert">
            {L("ConfirmationMailSentPleaseClickLinkInTheEmail", {
              0: model.emailAddress,
            })}
          </div>
        )}

        {!model.isActive && (
          <div className="alert alert-warning" role="alert">
            {L("YourAccountIsWaitingToBeActivatedByAdmin")}
          </div>
        )}

        {tenantUrl ? (
          <a href={tenantUrl}>
            <button
              type="button"
              className="btn btn-light-primary fw-bolder fs-h6 px-8 py-4 my-3"
            >
              ← {L("TenantRegistrationLoginInfo")}
            </button>
          </a>
        ) : (
          <Link to="/">
            <button
              type="button"
              className="btn btn-light-primary fw-bolder fs-h6 px-8 py-4 my-3"
            >
              ← {L("GoToLoginPage")}
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default RegisterTenantResultPage;
