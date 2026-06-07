import { forwardRef, useImperativeHandle, useState } from "react";
import { Modal } from "antd";
import {
  PaymentServiceProxy,
  type SubscriptionPaymentProductDto,
} from "../../../../api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useCurrencySign } from "@/hooks/useCurrencySign";

export type ShowDetailModalHandle = {
  show: (paymentId: number) => void;
};

const ShowDetailModal = forwardRef<ShowDetailModalHandle>((_props, ref) => {
  const paymentService = useServiceProxy(PaymentServiceProxy, []);
  const currencySign = useCurrencySign();
  const [visible, setVisible] = useState(false);
  const [products, setProducts] = useState<SubscriptionPaymentProductDto[]>([]);

  useImperativeHandle(ref, () => ({
    show: async (paymentId: number) => {
      const payment = await paymentService.getPayment(paymentId);
      setProducts(payment.subscriptionPaymentProducts ?? []);
      setVisible(true);
    },
  }));

  return (
    <Modal
      title={L("Detail")}
      open={visible}
      onCancel={() => setVisible(false)}
      width={800}
      mask={{ closable: false }}
      footer={null}
    >
      <div className="table-responsive">
        <table className="table table-rounded table-striped border gy-7 gs-7">
          <thead>
            <tr className="fw-semibold fs-6 text-gray-800 border-bottom border-gray-200">
              <th>#</th>
              <th>{L("Item")}</th>
              <th>{L("Amount")}</th>
              <th>{L("TotalAmount")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.count}</td>
                <td>{p.description}</td>
                <td>
                  {currencySign}
                  {Number(p.amount || 0).toFixed(2)}
                </td>
                <td>
                  {currencySign}
                  {Number((p.amount || 0) * (p.count || 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
});

export default ShowDetailModal;
