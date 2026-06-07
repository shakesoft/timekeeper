import React, { useState, useEffect, useCallback } from "react";
import {
  CachingServiceProxy,
  EntityDtoOfString,
  type CacheDto,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { setLoading } from "@/app/slices/authSlice";

const CachesTab: React.FC = () => {
  const cachingService = useServiceProxy(CachingServiceProxy, []);

  const [caches, setCaches] = useState<CacheDto[]>([]);

  const fetchCaches = useCallback(async () => {
    setLoading(true);
    try {
      const result = await cachingService.getAllCaches();
      setCaches(result.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [cachingService]);

  useEffect(() => {
    fetchCaches();
  }, [fetchCaches]);

  const clearCache = async (cacheName: string) => {
    await cachingService.clearCache(new EntityDtoOfString({ id: cacheName }));
    abp.notify.success(L("CacheSuccessfullyCleared"));
  };

  const clearAllCaches = async () => {
    await cachingService.clearAllCaches();
    abp.notify.success(L("AllCachesSuccessfullyCleared"));
    fetchCaches();
  };

  return (
    <>
      <div className="row m-3">
        <div className="col-xl-6">
          <p className="mt-5">{L("CachesHeaderInfo")}</p>
        </div>
        <div className="col-xl-6 text-end">
          <button
            className="btn btn-primary float-end"
            onClick={clearAllCaches}
          >
            <i className="fa fa-recycle"></i>
            <span className="ms-2">{L("ClearAll")}</span>
          </button>
        </div>
      </div>
      <div className="row m-3">
        <div className="col-xl-12">
          <table className="table table-striped table-hover table-bordered">
            <tbody>
              {caches.map((cache) => (
                <tr key={cache.name}>
                  <td className="d-flex justify-content-between align-items-center">
                    <span>{cache.name}</span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => clearCache(cache.name!)}
                    >
                      {L("Clear")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CachesTab;
