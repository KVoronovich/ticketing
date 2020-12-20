import 'bootstrap/dist/css/bootstrap.css';

import Header from '../components/header';
import buildClient from '../api/build-client';

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <Header currentUser={currentUser} />
            <div className="container">
                <Component {...pageProps} currentUser={currentUser} />
            </div>
        </div>
    );
};

AppComponent.getInitialProps = async (context) => {
    const client = buildClient(context.ctx);
    const { data } = await client.get('/api/users/currentuser');

    // call get initial props of page
    let pageProps = {};
    if (context.Component.getInitialProps) {
        pageProps = await context.Component.getInitialProps(context.ctx, client, data.currentUser);
    }

    return {
        pageProps,
        currentUser: data.currentUser
    };
}

export default AppComponent;
