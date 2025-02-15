import Navigation from "@/components/Navigation";
import { Outlet } from "react-router";

function MainLayout() {
    return (
        <>
            <Navigation name="Manupa" />
            <Outlet />
        </>
    )
}

export default MainLayout;