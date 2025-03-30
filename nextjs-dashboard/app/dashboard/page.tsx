import {Card} from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import {lusitana} from '@/app/ui/fonts';
import {fetchRevenue, fetchLatestInvoices, fetchCardData} from '@/app/lib/data';

export default async function Page() {
    let startTime = new Date();

    async function delayWrapper<T>(func: () => T, time: number = 2000): Promise<T> {
        return new Promise((resolve) => setTimeout(() => resolve(func()), time));
    }

    const invoiceCountPromise = delayWrapper(fetchRevenue);
    const customerCountPromise = delayWrapper(fetchLatestInvoices);
    const invoiceStatusPromise = delayWrapper(fetchCardData);

    const data = await Promise.all([
        invoiceCountPromise,
        customerCountPromise,
        invoiceStatusPromise,
    ]);

    const revenue = data[0];
    const latestInvoices = data[1];
    const {
        totalPaidInvoices,
        totalPendingInvoices,
        numberOfInvoices,
        numberOfCustomers
    } = data[2];


    let endTime = new Date();
    const diffInSeconds = Math.abs((endTime.getTime() - startTime.getTime()) / 1000);
    return (
        <main>
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
                Dashboard. {diffInSeconds} 초 소요됨
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card title="Collected" value={totalPaidInvoices} type="collected"/>
                <Card title="Pending" value={totalPendingInvoices} type="pending"/>
                <Card title="Total Invoices" value={numberOfInvoices} type="invoices"/>
                {<Card
                    title="Total Customers"
                    value={numberOfCustomers}
                    type="customers"
                />}
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <RevenueChart revenue={revenue}/>
                <LatestInvoices latestInvoices={latestInvoices}/>
            </div>
        </main>
    );
}