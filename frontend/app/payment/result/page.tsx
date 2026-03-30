import PaymentResultClient from "./PaymentResultClient";

type PaymentResultSearchParams = {
  orderId?: string;
};

type PaymentResultPageProps = {
  searchParams: Promise<PaymentResultSearchParams>;
};

export default async function PaymentResultPage({ searchParams }: PaymentResultPageProps) {
  const resolvedSearchParams = await searchParams;
  return <PaymentResultClient orderId={resolvedSearchParams.orderId} />;
}