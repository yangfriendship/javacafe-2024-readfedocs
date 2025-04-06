// export const dynamic = 'force-static'; // 💡 이걸로 강제 정적 처리!
export const revalidate = 3600; // 1시간마다 새로고침 (선택적)

function ListItem({name}: { name: string }) {
    return <li>{name}</li>;
}

async function getItems(): Promise<string[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(["item1", "item2", "item3"]);
        }, 2000);
    });
}

export default async function Page() {

    const itemNames: string[] = await getItems();

    return (
        <>
            {itemNames.map(name => {
                return {name: name}
            })
                .map((item => <ListItem key={item.name} {...item}/>))
            }
        </>
    )
}

