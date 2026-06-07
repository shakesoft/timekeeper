import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  EditionSelectDto,
  EditionWithFeaturesDto,
  EditionsSelectOutput,
  FlatFeatureSelectDto,
  TenantRegistrationServiceProxy,
  SubscriptionStartType,
} from "../../../../api/generated/service-proxies";
import { useSession } from "../../../../hooks/useSession";
import { useCurrencySign } from "../../../../hooks/useCurrencySign";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import classNames from "classnames";
import { useTheme } from "@/hooks/useTheme";

const SelectEditionPage: React.FC = () => {
  const { user } = useSession();
  const tenantRegistrationService = useServiceProxy(
    TenantRegistrationServiceProxy,
    [],
  );
  const { containerClass } = useTheme();
  const [editionsSelectOutput, setOutput] = useState<EditionsSelectOutput>(
    new EditionsSelectOutput(),
  );
  const [paymentPeriodType, setPaymentPeriodType] = useState<
    "monthly" | "annual"
  >("monthly");

  const isUserLoggedIn = useMemo(() => (user?.id ?? 0) > 0, [user]);
  const currencySign = useCurrencySign();

  useEffect(() => {
    tenantRegistrationService.getEditionsForSelect().then((res) => {
      setOutput(res);
    });
  }, [tenantRegistrationService]);

  const isFree = (edition: EditionSelectDto) => !!edition.isFree;

  const isTrueFalseFeature = (feature: FlatFeatureSelectDto) =>
    feature.inputType?.name === "CHECKBOX";

  const featureEnabledForEdition = (
    feature: FlatFeatureSelectDto,
    edition: EditionWithFeaturesDto,
  ) => {
    const fv = (edition.featureValues || []).find(
      (f) => f.name === feature.name,
    );
    return (fv?.value || "").toLowerCase() === "true";
  };

  const getFeatureValueForEdition = (
    feature: FlatFeatureSelectDto,
    edition: EditionWithFeaturesDto,
  ) => {
    const fv = (edition.featureValues || []).find(
      (f) => f.name === feature.name,
    );
    return fv?.value || "";
  };

  return (
    <div className={classNames(containerClass)}>
      <div className="card shadow-lg">
        <div className="card-body">
          <div className="row text-center mt-10 mb-0 pricing-items">
            <div className="w-100 d-flex justify-content-center">
              <div
                className="nav bg-light rounded-pill px-3 py-2 mb-15 w-225px justify-content-center"
                data-kt-buttons="true"
              >
                <button
                  className={`nav-link btn btn-active btn-active-dark fw-bold btn-color-gray-600 py-3 px-5 m-1 rounded-pill ${paymentPeriodType === "monthly" ? "active" : ""}`}
                  onClick={() => setPaymentPeriodType("monthly")}
                >
                  {L("Monthly")}
                </button>
                <button
                  className={`nav-link btn btn-active btn-active-dark fw-bold btn-color-gray-600 py-3 px-5 m-1 rounded-pill ${paymentPeriodType === "annual" ? "active" : ""}`}
                  onClick={() => setPaymentPeriodType("annual")}
                >
                  {L("Annual")}
                </button>
              </div>
            </div>
          </div>

          <div className="row justify-content-center mt-10 mb-0 pricing-items">
            {(editionsSelectOutput.editionsWithFeatures || []).map((ewf) => (
              <div key={ewf.edition?.id} className="col-xl-4">
                <div className="d-flex h-100 align-items-center">
                  <div className="w-100 d-flex flex-column flex-center rounded-3 bg-light bg-opacity-75 py-15 px-10 mb-10">
                    <div className="mb-7 text-center">
                      <h1 className="text-gray-900 mb-5 fw-bolder">
                        {ewf.edition?.displayName}
                      </h1>
                      {isFree(ewf.edition!) ? (
                        <div className="text-center">
                          <span className="fs-3x fw-bold text-primary">
                            {L("Free")}
                          </span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="mb-2 text-primary">
                            {currencySign}
                          </span>
                          {paymentPeriodType === "monthly" && (
                            <span className="fs-3x fw-bold text-primary">
                              {Number(ewf.edition?.monthlyPrice || 0).toFixed(
                                2,
                              )}
                            </span>
                          )}
                          {paymentPeriodType === "annual" && (
                            <span className="fs-3x fw-bold text-primary">
                              {Number(ewf.edition?.annualPrice || 0).toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="w-100 mb-10">
                      {(editionsSelectOutput.allFeatures || []).map(
                        (feature) => (
                          <div
                            key={`${ewf.edition?.id}-${feature.name}`}
                            className="d-flex align-items-center mb-5"
                          >
                            <span className="fw-semibold fs-6 text-gray-800 flex-grow-1 pe-3">
                              {feature.displayName}
                            </span>
                            {isTrueFalseFeature(feature) ? (
                              featureEnabledForEdition(feature, ewf) ? (
                                <i className="far fa-check-circle text-success fs-1" />
                              ) : (
                                <i className="far fa-times-circle text-muted fs-1" />
                              )
                            ) : (
                              <span className="text-success text-left">
                                {getFeatureValueForEdition(feature, ewf)}
                              </span>
                            )}
                          </div>
                        ),
                      )}
                    </div>

                    <div>
                      {!isUserLoggedIn && isFree(ewf.edition!) && (
                        <Link
                          className="btn btn-success btn-sm me-2 mb-2"
                          to={`/account/register-tenant?editionId=${encodeURIComponent(String(ewf.edition?.id))}&subscriptionStartType=${encodeURIComponent(String(SubscriptionStartType.Free))}`}
                        >
                          {L("GetStarted")}
                        </Link>
                      )}

                      {!isUserLoggedIn &&
                        !isFree(ewf.edition!) &&
                        (ewf.edition?.trialDayCount || 0) > 0 && (
                          <Link
                            className="btn btn-warning btn-sm me-2 mb-2"
                            to={`/account/register-tenant?editionId=${encodeURIComponent(String(ewf.edition?.id))}&subscriptionStartType=${encodeURIComponent(String(SubscriptionStartType.Trial))}`}
                          >
                            {L("FreeTrial")}
                          </Link>
                        )}

                      {!isUserLoggedIn && !isFree(ewf.edition!) && (
                        <Link
                          className="btn btn-primary btn-sm me-2 mb-2 buy-now"
                          to={`/account/register-tenant?editionId=${encodeURIComponent(String(ewf.edition?.id))}&subscriptionStartType=${encodeURIComponent(String(SubscriptionStartType.Paid))}&paymentPeriodType=${encodeURIComponent(paymentPeriodType)}`}
                        >
                          {L("BuyNow")}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectEditionPage;
