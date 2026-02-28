async function test() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const urls = [
        'https://saavn.dev/api/search/songs?query=don',
        'https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=don',
        'https://saavn.me/search/songs?query=don',
        'https://jiosaavn-api-v3.vercel.app/search/songs?query=don',
        'https://jiosaavn-api-taupe-two.vercel.app/search/songs?query=don'
    ];
    for (const u of urls) {
        try {
            console.log('Fetching', u);
            const res = await fetch(u);
            const text = await res.text();
            if (text.startsWith('{')) {
                const data = JSON.parse(text);
                console.log('SUCCESS:', u, Object.keys(data));
            } else {
                console.log('HTML returned:', u);
            }
        } catch (e) {
            console.error('ERROR:', u, e.message);
        }
    }
}
test();
