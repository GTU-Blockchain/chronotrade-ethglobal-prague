import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAccount } from "wagmi";
import Home from "./pages/Home";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import MyServices from "./pages/MyServices";
import Explore from "./pages/Explore";
import Details from "./pages/Details";
import Create from "./pages/Create";
import Chat from "./pages/Chat";
import Comments from "./pages/Comments";

function App() {
    const { isConnected } = useAccount();

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/wallet"
                    element={
                        isConnected ? <Wallet /> : <Navigate to="/" replace />
                    }
                />
                <Route
                    path="/profile"
                    element={
                        isConnected ? <Profile /> : <Navigate to="/" replace />
                    }
                />
                <Route
                    path="/my-services"
                    element={
                        isConnected ? (
                            <MyServices />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />
                <Route path="/explore" element={<Explore />} />
                <Route path="/details" element={<Details />} />
                <Route path="/create" element={<Create />} />
                <Route
                    path="/chat"
                    element={
                        isConnected ? <Chat /> : <Navigate to="/" replace />
                    }
                />
                <Route path="/comments" element={<Comments />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
