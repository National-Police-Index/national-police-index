export interface State {
    name: string;
    reference: string;
    hasData: boolean;
    key: string;
    count?: number;
}

export const _US_STATES_MAP = {
    'a0': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[4.21rem] top-[8.42rem] absolute">

                <svg width="68" height="69" viewBox="0 0 68 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.38347 67.125V1.75H66.7669V67.125H1.38347Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a0': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[4.95rem] top-[9.87rem] absolute">

                <svg width="44" height="22" viewBox="0 0 44 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.87188 21.9648L0.129242 0.964905H2.71328L7.10283 18.0685H7.30799L11.7788 0.964905H14.6504L19.1218 18.0685H19.3269L23.7159 0.964905H26.3005L20.5573 21.9648H17.9323L13.2967 5.23059H13.1325L8.49743 21.9648H5.87188ZM28.4062 21.9648H25.7398L33.4516 0.964905H36.0771L43.7889 21.9648H41.1225L34.8462 4.28734H34.6825L28.4062 21.9648ZM29.3905 13.7619H40.1382V16.0178H29.3905V13.7619Z" fill="black" />
                </svg>
            </div>
        )
    },
    'a2': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[8.42rem] top-[8.42rem] absolute">

                <svg width="69" height="69" viewBox="0 0 69 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.76694 67.125V1.75H67.1504V67.125H1.76694Z" fill="#BEBEBE" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a2': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[9.80rem] top-[9.87rem] absolute">

                <svg width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.40701 0.964905V21.9648H0.863281V0.964905H3.40701ZM14.6986 21.9648H8.21712V0.964905H14.9855C17.0233 0.964905 18.7662 1.38539 20.2162 2.22637C21.6655 3.06014 22.7762 4.25967 23.5487 5.82493C24.3212 7.38358 24.7074 9.25022 24.7074 11.4237C24.7074 13.6115 24.3181 15.4944 23.5384 17.0735C22.7593 18.646 21.624 19.8558 20.1338 20.7034C18.6435 21.5444 16.832 21.9648 14.6986 21.9648ZM10.7608 19.709H14.5343C16.2712 19.709 17.7104 19.3739 18.8523 18.7044C19.9936 18.0342 20.8449 17.0808 21.4056 15.8434C21.9663 14.6059 22.2467 13.1327 22.2467 11.4237C22.2467 9.72846 21.9694 8.26908 21.4158 7.0455C20.8617 5.8147 20.0345 4.87144 18.9341 4.21514C17.8331 3.55222 16.4626 3.22076 14.8219 3.22076H10.7608V19.709Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a4': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[12.63rem] top-[8.42rem] absolute">

                <svg width="68" height="69" viewBox="0 0 68 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.15039 67.125V1.75H66.5339V67.125H1.15039Z" fill="#484848" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a4': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[13.51rem] top-[9.87rem] absolute">

                <svg width="41" height="22" viewBox="0 0 41 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.124634 0.964905H3.16051L10.2977 18.3964H10.5438L17.6816 0.964905H20.7175V21.9648H18.338V6.0096H18.1329L11.5696 21.9648H9.27255L2.70928 6.0096H2.50412V21.9648H0.124634V0.964905ZM24.3791 3.22076V0.964905H40.1312V3.22076H33.527V21.9648H30.9839V3.22076H24.3791Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a6': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[16.85rem] top-[8.42rem] absolute">

                <svg width="68" height="69" viewBox="0 0 68 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.53387 67.125V1.75H66.9173V67.125H1.53387Z" fill="#BEBEBE" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a6': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[284.41px] top-[157.96px] absolute">

                <svg width="39" height="22" viewBox="0 0 39 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.0651 0.964905V21.9648H14.6038L3.15888 5.47662H2.95431V21.9648H0.410583V0.964905H2.87189L14.3578 17.494H14.5629V0.964905H17.0651ZM28.3471 21.9648H21.8656V0.964905H28.634C30.6712 0.964905 32.4147 1.38539 33.8641 2.22637C35.3134 3.06014 36.4246 4.25967 37.1971 5.82493C37.9696 7.38358 38.3559 9.25022 38.3559 11.4237C38.3559 13.6115 37.966 15.4944 37.1869 17.0735C36.4072 18.646 35.2725 19.8558 33.7823 20.7034C32.2914 21.5444 30.4799 21.9648 28.3471 21.9648ZM24.4087 19.709H28.1828C29.9191 19.709 31.3583 19.3739 32.5002 18.7044C33.6421 18.0342 34.4934 17.0808 35.0535 15.8434C35.6142 14.6059 35.8946 13.1327 35.8946 11.4237C35.8946 9.72846 35.6179 8.26908 35.0638 7.0455C34.5102 5.8147 33.683 4.87144 32.582 4.21514C31.4816 3.55222 30.1105 3.22076 28.4698 3.22076H24.4087V19.709Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a8': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[336.92px] top-[134.75px] absolute">

                <svg width="69" height="69" viewBox="0 0 69 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.91736 67.125V1.75H67.3008V67.125H1.91736Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a8': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[21.84rem] top-[9.87rem] absolute">

                <svg width="43" height="22" viewBox="0 0 43 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.387512 0.964905H3.42339L10.5606 18.3964H10.8067L17.9445 0.964905H20.9804V21.9648H18.6009V6.0096H18.3957L11.8325 21.9648H9.53543L2.97216 6.0096H2.767V21.9648H0.387512V0.964905ZM42.445 0.964905V21.9648H39.9837L28.5394 5.47662H28.3342V21.9648H25.7905V0.964905H28.2518L39.7377 17.494H39.9428V0.964905H42.445Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a10': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[25.27rem] top-[8.42rem] absolute">

                <svg width="68" height="69" viewBox="0 0 68 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.30078 67.125V1.75H66.6842V67.125H1.30078Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a10': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[26.78rem] top-[9.87rem] absolute">

                <svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.04667 0.964905V21.9648H0.50293V0.964905H3.04667ZM7.85677 21.9648V0.964905H10.4005V19.709H20.1633V21.9648H7.85677Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a12': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[29.48rem] top-[8.42rem] absolute">

                <svg width="69" height="69" viewBox="0 0 69 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.68433 67.125V1.75H67.0678V67.125H1.68433Z" fill="#484848" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a12': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[30.71rem] top-[9.87rem] absolute">

                <svg width="29" height="22" viewBox="0 0 29 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.374146 0.964905H3.41002L10.5472 18.3964H10.7933L17.9312 0.964905H20.967V21.9648H18.5875V6.0096H18.3824L11.8191 21.9648H9.52206L2.9588 6.0096H2.75363V21.9648H0.374146V0.964905ZM28.3208 0.964905V21.9648H25.7771V0.964905H28.3208Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a14': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[4.21rem] top-[12.63rem] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.38347 66.5V1.125H66.7669V66.5H1.38347Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a14': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[5.17rem] top-[14.07rem] absolute">

                <svg width="39" height="22" viewBox="0 0 39 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.1847 10.8396C19.1847 13.0545 18.7846 14.9687 17.985 16.5821C17.1849 18.1955 16.0875 19.4395 14.6929 20.3142C13.2983 21.1895 11.7051 21.6268 9.91406 21.6268C8.12238 21.6268 6.52985 21.1895 5.13525 20.3142C3.74005 19.4395 2.64326 18.1955 1.84309 16.5821C1.04291 14.9687 0.643417 13.0545 0.643417 10.8396C0.643417 8.62524 1.04291 6.71106 1.84309 5.09767C2.64326 3.48428 3.74005 2.24026 5.13525 1.36499C6.52985 0.490314 8.12238 0.0529785 9.91406 0.0529785C11.7051 0.0529785 13.2983 0.490314 14.6929 1.36499C16.0875 2.24026 17.1849 3.48428 17.985 5.09767C18.7846 6.71106 19.1847 8.62524 19.1847 10.8396ZM16.7234 10.8396C16.7234 9.02167 16.419 7.48708 15.8107 6.23583C15.2091 4.98458 14.3921 4.03833 13.3596 3.39526C12.3338 2.75279 11.1853 2.43154 9.91406 2.43154C8.64219 2.43154 7.49006 2.75279 6.45765 3.39526C5.43246 4.03833 4.61543 4.98458 4.00718 6.23583C3.40554 7.48708 3.10472 9.02167 3.10472 10.8396C3.10472 12.6581 3.40554 14.1927 4.00718 15.4439C4.61543 16.6946 5.43246 17.6415 6.45765 18.2839C7.49006 18.927 8.64219 19.2482 9.91406 19.2482C11.1853 19.2482 12.3338 18.927 13.3596 18.2839C14.3921 17.6415 15.2091 16.6946 15.8107 15.4439C16.419 14.1927 16.7234 12.6581 16.7234 10.8396ZM23.1724 21.3399V0.339918H30.2687C31.9099 0.339918 33.2564 0.620252 34.3093 1.18091C35.3621 1.73435 36.1419 2.49652 36.6478 3.46744C37.1532 4.43776 37.4065 5.54224 37.4065 6.77905C37.4065 8.01646 37.1532 9.1137 36.6478 10.0708C36.1419 11.0279 35.3658 11.7798 34.3195 12.3266C33.2739 12.8669 31.937 13.137 30.3096 13.137H24.567V10.8396H30.2278C31.3492 10.8396 32.2517 10.676 32.9351 10.3475C33.6258 10.0197 34.1246 9.55465 34.4326 8.95308C34.7467 8.34491 34.9043 7.62003 34.9043 6.77905C34.9043 5.93867 34.7467 5.20356 34.4326 4.57492C34.118 3.94569 33.6156 3.46022 32.9249 3.11853C32.2342 2.77022 31.3215 2.59578 30.1869 2.59578H25.7155V21.3399H23.1724ZM33.0585 11.9062L38.2271 21.3399H35.2731L30.1869 11.9062H33.0585Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a16': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[134.77px] top-[202.12px] absolute">

                <svg width="69" height="68" viewBox="0 0 69 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.76694 66.5V1.125H67.1504V66.5H1.76694Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a16': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[151.15px] top-[225.34px] absolute">

                <svg width="36" height="22" viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.9307 0.339905H16.4744V14.2444C16.4744 15.6797 16.1357 16.9617 15.4588 18.0896C14.7892 19.2103 13.8422 20.0958 12.6185 20.7449C11.3941 21.388 9.95865 21.7092 8.31077 21.7092C6.66348 21.7092 5.22736 21.388 4.00362 20.7449C2.77989 20.0958 1.82991 19.2103 1.15307 18.0896C0.482842 16.9617 0.147736 15.6797 0.147736 14.2444V0.339905H2.69146V14.0393C2.69146 15.0644 2.91706 15.9769 3.36829 16.777C3.81952 17.5699 4.46208 18.1955 5.29595 18.6533C6.13704 19.1044 7.14178 19.33 8.31077 19.33C9.48035 19.33 10.4851 19.1044 11.3262 18.6533C12.1673 18.1955 12.8098 17.5699 13.2538 16.777C13.705 15.9769 13.9307 15.0644 13.9307 14.0393V0.339905ZM20.1155 2.59576V0.339905H35.8676V2.59576H29.2634V21.3398H26.7203V2.59576H20.1155Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a18': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[12.63rem] top-[12.63rem] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.15039 66.5V1.125H66.5339V66.5H1.15039Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a18': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[13.31rem] top-[14.08rem] absolute">

                <svg width="45" height="22" viewBox="0 0 45 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.73634 21.3398L-0.00628662 0.339905H2.57774L6.9673 17.4435H7.17245L11.6432 0.339905H14.5148L18.9862 17.4435H19.1914L23.5803 0.339905H26.165L20.4217 21.3398H17.7968L13.1612 4.60559H12.9969L8.3619 21.3398H5.73634ZM27.2401 0.339905H30.1526L35.9777 10.1424H36.2238L42.0482 0.339905H44.9607L37.3723 12.6858V21.3398H34.8286V12.6858L27.2401 0.339905Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a20': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[16.85rem] top-[12.63rem] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.53387 66.5V1.125H66.9173V66.5H1.53387Z" fill="#484848" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a20': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[17.83rem] top-[14.07rem] absolute">

                <svg width="36" height="22" viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.7014 5.58975C12.5786 4.55085 12.0793 3.74417 11.2045 3.16967C10.3291 2.59578 9.2558 2.30884 7.98394 2.30884C7.0544 2.30884 6.241 2.45923 5.5431 2.76001C4.85302 3.06079 4.31274 3.47405 3.92288 4.00042C3.54024 4.52679 3.34893 5.12474 3.34893 5.79488C3.34893 6.35554 3.48188 6.8374 3.749 7.24045C4.02215 7.63748 4.3711 7.96893 4.79465 8.23543C5.21881 8.4953 5.66282 8.71066 6.12789 8.88151C6.59295 9.04513 7.02012 9.17867 7.40999 9.28153L9.54278 9.85543C10.0897 9.9992 10.6985 10.1971 11.3681 10.4504C12.045 10.703 12.6912 11.0483 13.3066 11.4857C13.9287 11.9164 14.4413 12.4704 14.845 13.1472C15.2481 13.8239 15.4497 14.6541 15.4497 15.6389C15.4497 16.7734 15.1525 17.7991 14.5574 18.7146C13.9696 19.6308 13.1081 20.3587 11.9734 20.8989C10.8453 21.4391 9.47481 21.7092 7.86121 21.7092C6.35712 21.7092 5.05457 21.4662 3.95358 20.9807C2.8598 20.4959 1.99824 19.8191 1.36953 18.9505C0.747439 18.0824 0.395474 17.0742 0.313049 15.9258H2.93861C3.00719 16.7187 3.27372 17.375 3.73819 17.8947C4.21048 18.4072 4.80488 18.7898 5.52263 19.0431C6.24761 19.2891 7.02674 19.4119 7.86121 19.4119C8.83166 19.4119 9.70342 19.2548 10.4759 18.9402C11.2484 18.619 11.8603 18.175 12.3115 17.6072C12.7628 17.0333 12.9884 16.3631 12.9884 15.5979C12.9884 14.9001 12.794 14.3329 12.4042 13.8955C12.0143 13.4582 11.5017 13.1027 10.8658 12.8289C10.2299 12.5558 9.54279 12.3164 8.80458 12.1113L6.21995 11.3732C4.57928 10.9016 3.28033 10.2278 2.32312 9.35313C1.36592 8.47786 0.887624 7.33309 0.887624 5.91821C0.887624 4.74216 1.20528 3.71709 1.84122 2.84181C2.48376 1.95992 3.34532 1.27655 4.42526 0.79109C5.51242 0.299011 6.72592 0.0529785 8.06637 0.0529785C9.42006 0.0529785 10.6233 0.295403 11.6762 0.780864C12.7291 1.25911 13.5629 1.9154 14.1784 2.74977C14.8005 3.58353 15.1284 4.5304 15.1627 5.58975H12.7014ZM25.8237 21.3399H19.3429V0.339918H26.1113C28.1484 0.339918 29.892 0.760401 31.3413 1.60139C32.7907 2.43515 33.9019 3.63468 34.6744 5.19995C35.4469 6.7586 35.8332 8.62523 35.8332 10.7987C35.8332 12.9866 35.4433 14.8694 34.6642 16.4485C33.8845 18.021 32.7498 19.2308 31.2589 20.0784C29.7687 20.9194 27.9571 21.3399 25.8237 21.3399ZM21.886 19.084H25.6601C27.3964 19.084 28.8355 18.7489 29.9774 18.0794C31.1193 17.4092 31.97 16.4558 32.5308 15.2184C33.0915 13.981 33.3719 12.5077 33.3719 10.7987C33.3719 9.10347 33.0951 7.64409 32.541 6.42051C31.9875 5.18972 31.1602 4.24646 30.0593 3.59015C28.9589 2.92723 27.5877 2.59578 25.947 2.59578H21.886V19.084Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a22': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[336.92px] top-[202.12px] absolute">

                <svg width="69" height="68" viewBox="0 0 69 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.91736 66.5V1.125H67.3008V66.5H1.91736Z" fill="#BEBEBE" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a22': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[359.62px] top-[225.34px] absolute">

                <svg width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.1591 0.339905V21.3398H0.615356V0.339905H3.1591ZM8.83074 21.3398H6.16428L13.8767 0.339905H16.5016L24.2134 21.3398H21.5475L15.2713 3.66234H15.107L8.83074 21.3398ZM9.8156 13.1369H20.5627V15.3928H9.8156V13.1369Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a24': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[25.27rem] top-[12.63rem] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.30078 66.5V1.125H66.6842V66.5H1.30078Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a24': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[26.61rem] top-[14.08rem] absolute">

                <svg width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.33927 0.339905V21.3398H0.795532V0.339905H3.33927ZM24.8039 0.339905V21.3398H22.3426L10.8982 4.85162H10.6931V21.3398H8.14937V0.339905H10.6107L22.0965 16.869H22.3017V0.339905H24.8039Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a26': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[29.48rem] top-[12.63rem] absolute">

                <svg width="69" height="68" viewBox="0 0 69 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.68433 66.5V1.125H67.0678V66.5H1.68433Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a26': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[30.34rem] top-[14.07rem] absolute">

                <svg width="40" height="22" viewBox="0 0 40 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.9815 10.8396C18.9815 13.0545 18.5814 14.9687 17.7818 16.5821C16.9816 18.1955 15.8842 19.4395 14.4896 20.3142C13.095 21.1895 11.5019 21.6268 9.71083 21.6268C7.91915 21.6268 6.32662 21.1895 4.93202 20.3142C3.53682 19.4395 2.44001 18.1955 1.63983 16.5821C0.839648 14.9687 0.440186 13.0545 0.440186 10.8396C0.440186 8.62524 0.839648 6.71106 1.63983 5.09767C2.44001 3.48428 3.53682 2.24026 4.93202 1.36499C6.32662 0.490314 7.91915 0.0529785 9.71083 0.0529785C11.5019 0.0529785 13.095 0.490314 14.4896 1.36499C15.8842 2.24026 16.9816 3.48428 17.7818 5.09767C18.5814 6.71106 18.9815 8.62524 18.9815 10.8396ZM16.5202 10.8396C16.5202 9.02167 16.2157 7.48708 15.6075 6.23583C15.0058 4.98458 14.1888 4.03833 13.1564 3.39526C12.1306 2.75279 10.9821 2.43154 9.71083 2.43154C8.43896 2.43154 7.28683 2.75279 6.25442 3.39526C5.22923 4.03833 4.4122 4.98458 3.80395 6.23583C3.20231 7.48708 2.90149 9.02167 2.90149 10.8396C2.90149 12.6581 3.20231 14.1927 3.80395 15.4439C4.4122 16.6946 5.22923 17.6415 6.25442 18.2839C7.28683 18.927 8.43896 19.2482 9.71083 19.2482C10.9821 19.2482 12.1306 18.927 13.1564 18.2839C14.1888 17.6415 15.0058 16.6946 15.6075 15.4439C16.2157 14.1927 16.5202 12.6581 16.5202 10.8396ZM22.9691 21.3399V0.339918H25.5122V9.6912H36.7111V0.339918H39.2543V21.3399H36.7111V11.9471H25.5122V21.3399H22.9691Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a28': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[539.07px] top-[202.12px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.06775 66.5V1.125H66.4512V66.5H1.06775Z" fill="#484848" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a28': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[557.55px] top-[225.34px] absolute">

                <svg width="33" height="22" viewBox="0 0 33 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.554321 21.3398V0.339905H7.65126C9.29854 0.339905 10.6456 0.637078 11.6919 1.23202C12.7447 1.81975 13.5238 2.61622 14.0298 3.62083C14.5358 4.62604 14.7885 5.74734 14.7885 6.98415C14.7885 8.22157 14.5358 9.34589 14.0298 10.3577C13.5305 11.3695 12.758 12.1762 11.7123 12.7778C10.6661 13.3728 9.32621 13.6699 7.69216 13.6699H2.6053V11.4141H7.61035C8.73842 11.4141 9.64387 11.2192 10.3279 10.8294C11.0114 10.4401 11.5071 9.91378 11.8146 9.25026C12.1292 8.58072 12.2863 7.82514 12.2863 6.98415C12.2863 6.14377 12.1292 5.39182 11.8146 4.72829C11.5071 4.06537 11.0078 3.54564 10.3177 3.16966C9.62704 2.78707 8.71073 2.59576 7.56882 2.59576H3.09806V21.3398H0.554321ZM17.3148 21.3398H14.6489L22.3607 0.339905H24.9857L32.698 21.3398H30.0316L23.7553 3.66234H23.5911L17.3148 21.3398ZM18.2996 13.1369H29.0467V15.3928H18.2996V13.1369Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a30': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[606.45px] top-[202.12px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.45123 66.5V1.125H66.8347V66.5H1.45123Z" fill="#787878" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a30': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[624.04px] top-[225.34px] absolute">

                <svg width="33" height="22" viewBox="0 0 33 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6905 0.339905V21.3398H14.2297L2.78664 4.85162H2.576V21.3398H0.0371094V0.339905H2.49779L13.9831 16.869H14.1876V0.339905H16.6905ZM29.5294 0.339905H32.0743V15.3513C32.0743 16.6916 31.8277 17.8297 31.3343 18.7664C30.841 19.7024 30.1491 20.4134 29.2527 20.8989C28.3563 21.3844 27.3034 21.6268 26.082 21.6268C24.9389 21.6268 23.9162 21.4186 23.0197 21.0018C22.1233 20.5777 21.4194 19.9761 20.908 19.1971C20.3906 18.4174 20.1379 17.491 20.1379 16.4179H22.6407C22.6407 17.0128 22.7851 17.532 23.0799 17.9765C23.3807 18.4138 23.7898 18.7561 24.3132 19.0022C24.8306 19.2482 25.4202 19.3709 26.082 19.3709C26.816 19.3709 27.4357 19.2175 27.9531 18.9095C28.4645 18.6021 28.8556 18.151 29.1203 17.556C29.391 16.9545 29.5294 16.22 29.5294 15.3513V0.339905Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a32': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[673.83px] top-[202.12px] absolute">

                <svg width="69" height="68" viewBox="0 0 69 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.83472 66.5V1.125H67.2182V66.5H1.83472Z" fill="#787878" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a32': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[689.39px] top-[225.05px] absolute">

                <svg width="37" height="22" viewBox="0 0 37 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.1172 6.90236H15.5723C15.4219 6.17086 15.1572 5.5284 14.7842 4.97436C14.4112 4.42092 13.96 3.9559 13.4305 3.57993C12.9011 3.19733 12.3175 2.9104 11.6737 2.7185C11.036 2.5272 10.3622 2.43154 9.66427 2.43154C8.39481 2.43154 7.23967 2.75279 6.21087 3.39526C5.18207 4.03833 4.36981 4.98458 3.75614 6.23583C3.1545 7.48708 2.85368 9.02167 2.85368 10.8396C2.85368 12.6581 3.1545 14.1927 3.75614 15.4439C4.36981 16.6946 5.18207 17.6415 6.21087 18.2839C7.23967 18.927 8.39481 19.2482 9.66427 19.2482C10.3622 19.2482 11.036 19.1526 11.6737 18.9607C12.3175 18.7694 12.9011 18.4861 13.4305 18.1101C13.96 17.7269 14.4112 17.2589 14.7842 16.7048C15.1572 16.1448 15.4219 15.5017 15.5723 14.7774H18.1172C17.9247 15.8506 17.5758 16.8113 17.0704 17.6589C16.565 18.5065 15.9333 19.2278 15.1812 19.8221C14.4292 20.4104 13.5869 20.858 12.6484 21.1654C11.7218 21.4734 10.7232 21.6268 9.66427 21.6268C7.8774 21.6268 6.28303 21.1895 4.88722 20.3142C3.49142 19.4395 2.39646 18.1955 1.59628 16.5821C0.796103 14.9687 0.393005 13.0545 0.393005 10.8396C0.393005 8.62524 0.796103 6.71106 1.59628 5.09767C2.39646 3.48428 3.49142 2.24026 4.88722 1.36499C6.28303 0.490314 7.8774 0.0529785 9.66427 0.0529785C10.7232 0.0529785 11.7218 0.206376 12.6484 0.514376C13.5869 0.821774 14.4292 1.27295 15.1812 1.86789C15.9333 2.45562 16.565 3.17327 17.0704 4.02087C17.5758 4.86186 17.9247 5.82256 18.1172 6.90236ZM20.7886 2.59578V0.339918H36.5394V2.59578H29.9334V21.3399H27.3945V2.59578H20.7886Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a34': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[67.38px] top-[269.50px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.38347 66.875V1.5H66.7669V66.875H1.38347Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a34': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[82.64px] top-[292.43px] absolute">

                <svg width="39" height="22" viewBox="0 0 39 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.3641 7.27736H15.8209C15.6705 6.54586 15.407 5.9034 15.031 5.34936C14.6622 4.79592 14.211 4.3309 13.6773 3.95493C13.1509 3.57233 12.5667 3.2854 11.9241 3.0935C11.281 2.9022 10.6114 2.80654 9.91406 2.80654C8.64219 2.80654 7.49006 3.12779 6.45765 3.77026C5.43246 4.41333 4.61543 5.35958 4.00718 6.61083C3.40554 7.86208 3.10472 9.39667 3.10472 11.2146C3.10472 13.0331 3.40554 14.5677 4.00718 15.8189C4.61543 17.0696 5.43246 18.0164 6.45765 18.6589C7.49006 19.302 8.64219 19.6232 9.91406 19.6232C10.6114 19.6232 11.281 19.5276 11.9241 19.3357C12.5667 19.1444 13.1509 18.861 13.6773 18.4851C14.211 18.1019 14.6622 17.6339 15.031 17.0798C15.407 16.5198 15.6705 15.8767 15.8209 15.1524H18.3641C18.1727 16.2256 17.8238 17.1863 17.3184 18.0339C16.8124 18.8815 16.1831 19.6028 15.4311 20.1971C14.679 20.7854 13.8349 21.233 12.8982 21.5404C11.9687 21.8484 10.9735 22.0018 9.91406 22.0018C8.12238 22.0018 6.52985 21.5645 5.13525 20.6892C3.74005 19.8145 2.64326 18.5705 1.84309 16.9571C1.04291 15.3437 0.643417 13.4295 0.643417 11.2146C0.643417 9.00024 1.04291 7.08606 1.84309 5.47267C2.64326 3.85928 3.74005 2.61526 5.13525 1.73999C6.52985 0.865314 8.12238 0.427979 9.91406 0.427979C10.9735 0.427979 11.9687 0.581376 12.8982 0.889376C13.8349 1.19677 14.679 1.64795 15.4311 2.24289C16.1831 2.83062 16.8124 3.54827 17.3184 4.39587C17.8238 5.23686 18.1727 6.19756 18.3641 7.27736ZM23.0466 21.7149H20.3802L28.092 0.714918H30.7175L38.4293 21.7149H35.7628L29.4872 4.03735H29.3229L23.0466 21.7149ZM24.0309 13.512H34.7786V15.7678H24.0309V13.512Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a36': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[134.77px] top-[269.50px] absolute">

                <svg width="69" height="68" viewBox="0 0 69 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.76694 66.875V1.5H67.1504V66.875H1.76694Z" fill="#484848" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a36': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[150.25px] top-[292.71px] absolute">

                <svg width="38" height="22" viewBox="0 0 38 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.8998 0.714905V21.7148H14.4385L2.99358 5.22662H2.78902V21.7148H0.2453V0.714905H2.70659L14.1925 17.244H14.3976V0.714905H16.8998ZM22.5619 0.714905L28.7966 18.3924H29.0427L35.2781 0.714905H37.9445L30.2327 21.7148H27.6072L19.8954 0.714905H22.5619Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a38': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[202.15px] top-[269.50px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.15039 66.875V1.5H66.5339V66.875H1.15039Z" fill="#484848" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a38': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[215.91px] top-[292.43px] absolute">

                <svg width="41" height="22" viewBox="0 0 41 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.6269 7.27736H16.0838C15.9334 6.54586 15.6698 5.9034 15.2938 5.34936C14.925 4.79592 14.4738 4.3309 13.9401 3.95493C13.4137 3.57233 12.8295 3.2854 12.187 3.0935C11.5438 2.9022 10.8742 2.80654 10.1769 2.80654C8.90503 2.80654 7.75289 3.12779 6.72048 3.77026C5.69529 4.41333 4.87825 5.35958 4.26999 6.61083C3.66835 7.86208 3.36754 9.39667 3.36754 11.2146C3.36754 13.0331 3.66835 14.5677 4.26999 15.8189C4.87825 17.0696 5.69529 18.0164 6.72048 18.6589C7.75289 19.302 8.90503 19.6232 10.1769 19.6232C10.8742 19.6232 11.5438 19.5276 12.187 19.3357C12.8295 19.1444 13.4137 18.861 13.9401 18.4851C14.4738 18.1019 14.925 17.6339 15.2938 17.0798C15.6698 16.5198 15.9334 15.8767 16.0838 15.1524H18.6269C18.4356 16.2256 18.0866 17.1863 17.5812 18.0339C17.0753 18.8815 16.4459 19.6028 15.6939 20.1971C14.9419 20.7854 14.0978 21.233 13.161 21.5404C12.2315 21.8484 11.2364 22.0018 10.1769 22.0018C8.38521 22.0018 6.79266 21.5645 5.39806 20.6892C4.00287 19.8145 2.90609 18.5705 2.10591 16.9571C1.30573 15.3437 0.90625 13.4295 0.90625 11.2146C0.90625 9.00024 1.30573 7.08606 2.10591 5.47267C2.90609 3.85928 4.00287 2.61526 5.39806 1.73999C6.79266 0.865314 8.38521 0.427979 10.1769 0.427979C11.2364 0.427979 12.2315 0.581376 13.161 0.889376C14.0978 1.19677 14.9419 1.64795 15.6939 2.24289C16.4459 2.83062 17.0753 3.54827 17.5812 4.39587C18.0866 5.23686 18.4356 6.19756 18.6269 7.27736ZM40.1691 11.2146C40.1691 13.4295 39.7691 15.3437 38.9689 16.9571C38.1693 18.5705 37.0719 19.8145 35.6773 20.6892C34.2827 21.5645 32.6896 22.0018 30.8985 22.0018C29.1068 22.0018 27.5143 21.5645 26.1191 20.6892C24.7245 19.8145 23.6271 18.5705 22.8275 16.9571C22.0273 15.3437 21.6279 13.4295 21.6279 11.2146C21.6279 9.00024 22.0273 7.08606 22.8275 5.47267C23.6271 3.85928 24.7245 2.61526 26.1191 1.73999C27.5143 0.865314 29.1068 0.427979 30.8985 0.427979C32.6896 0.427979 34.2827 0.865314 35.6773 1.73999C37.0719 2.61526 38.1693 3.85928 38.9689 5.47267C39.7691 7.08606 40.1691 9.00024 40.1691 11.2146ZM37.7078 11.2146C37.7078 9.39667 37.4034 7.86208 36.7952 6.61083C36.1935 5.35958 35.3765 4.41333 34.3441 3.77026C33.3183 3.12779 32.1698 2.80654 30.8985 2.80654C29.6266 2.80654 28.4745 3.12779 27.4421 3.77026C26.4169 4.41333 25.5999 5.35958 24.991 6.61083C24.3894 7.86208 24.0886 9.39667 24.0886 11.2146C24.0886 13.0331 24.3894 14.5677 24.991 15.8189C25.5999 17.0696 26.4169 18.0164 27.4421 18.6589C28.4745 19.302 29.6266 19.6232 30.8985 19.6232C32.1698 19.6232 33.3183 19.302 34.3441 18.6589C35.3765 18.0164 36.1935 17.0696 36.7952 15.8189C37.4034 14.5677 37.7078 13.0331 37.7078 11.2146Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a40': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[269.53px] top-[269.50px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.53387 66.875V1.5H66.9173V66.875H1.53387Z" fill="#787878" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a40': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[286.22px] top-[292.71px] absolute">

                <svg width="35" height="22" viewBox="0 0 35 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.87 0.714905V21.7148H14.4087L2.96378 5.22662H2.75921V21.7148H0.215485V0.714905H2.67679L14.1627 17.244H14.3678V0.714905H16.87ZM21.6705 21.7148V0.714905H34.3458V2.97076H24.2136V10.0662H33.6894V12.322H24.2136V19.459H34.5101V21.7148H21.6705Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a42': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[336.92px] top-[269.50px] absolute">

                <svg width="69" height="68" viewBox="0 0 69 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.91736 66.875V1.5H67.3008V66.875H1.91736Z" fill="#484848" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a42': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[349.39px] top-[292.43px] absolute">

                <svg width="44" height="22" viewBox="0 0 44 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.387512 0.714918H3.42339L10.5606 18.1464H10.8067L17.9445 0.714918H20.9804V21.7149H18.6009V5.75961H18.3957L11.8325 21.7149H9.53543L2.97216 5.75961H2.767V21.7149H0.387512V0.714918ZM43.5118 11.2146C43.5118 13.4295 43.1117 15.3437 42.3121 16.9571C41.5119 18.5705 40.4145 19.8145 39.0199 20.6892C37.6253 21.5645 36.0322 22.0018 34.2411 22.0018C32.45 22.0018 30.8569 21.5645 29.4623 20.6892C28.0671 19.8145 26.9703 18.5705 26.1701 16.9571C25.3705 15.3437 24.9704 13.4295 24.9704 11.2146C24.9704 9.00024 25.3705 7.08606 26.1701 5.47267C26.9703 3.85928 28.0671 2.61526 29.4623 1.73999C30.8569 0.865314 32.45 0.427979 34.2411 0.427979C36.0322 0.427979 37.6253 0.865314 39.0199 1.73999C40.4145 2.61526 41.5119 3.85928 42.3121 5.47267C43.1117 7.08606 43.5118 9.00024 43.5118 11.2146ZM41.0504 11.2146C41.0504 9.39667 40.746 7.86208 40.1377 6.61083C39.5361 5.35958 38.7191 4.41333 37.6867 3.77026C36.6615 3.12779 35.5123 2.80654 34.2411 2.80654C32.9692 2.80654 31.8171 3.12779 30.7853 3.77026C29.7595 4.41333 28.9425 5.35958 28.3342 6.61083C27.7326 7.86208 27.4317 9.39667 27.4317 11.2146C27.4317 13.0331 27.7326 14.5677 28.3342 15.8189C28.9425 17.0696 29.7595 18.0164 30.7853 18.6589C31.8171 19.302 32.9692 19.6232 34.2411 19.6232C35.5123 19.6232 36.6615 19.302 37.6867 18.6589C38.7191 18.0164 39.5361 17.0696 40.1377 15.8189C40.746 14.5677 41.0504 13.0331 41.0504 11.2146Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a44': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[404.30px] top-[269.50px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.30078 66.875V1.5H66.6842V66.875H1.30078Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a44': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[421.58px] top-[292.71px] absolute">

                <svg width="36" height="22" viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.584106 21.7148V0.714905H3.12785V11.1328H3.37392L12.8082 0.714905H16.131L7.31163 10.1895L16.131 21.7148H13.0549L5.75278 11.9533L3.12785 14.9064V21.7148H0.584106ZM17.3295 0.714905H20.242L26.0671 10.5174H26.3132L32.1376 0.714905H35.0501L27.4617 13.0608V21.7148H24.9179V13.0608L17.3295 0.714905Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a46': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[471.68px] top-[269.50px] absolute">

                <svg width="69" height="68" viewBox="0 0 69 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.68433 66.875V1.5H67.0678V66.875H1.68433Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a46': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[482.53px] top-[292.71px] absolute">

                <svg width="46" height="22" viewBox="0 0 46 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.27021 21.7148L0.527588 0.714905H3.11161L7.50118 17.8185H7.70634L12.1771 0.714905H15.0487L19.5201 17.8185H19.7253L24.1142 0.714905H26.6988L20.9556 21.7148H18.3307L13.695 4.98059H13.5308L8.89577 21.7148H6.27021ZM30.4404 0.714905L36.6752 18.3924H36.9213L43.1566 0.714905H45.8231L38.1113 21.7148H35.4858L27.774 0.714905H30.4404Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a48': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[539.07px] top-[269.50px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.06775 66.875V1.5H66.4512V66.875H1.06775Z" fill="#484848" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a48': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[554.85px] top-[292.71px] absolute">

                <svg width="37" height="22" viewBox="0 0 37 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.51339 0.714905L9.74877 18.3924H9.99484L16.2296 0.714905H18.8961L11.1843 21.7148H8.55872L0.846924 0.714905H3.51339ZM20.9356 21.7148H18.2692L25.981 0.714905H28.6065L36.3183 21.7148H33.6518L27.3755 4.03734H27.2113L20.9356 21.7148ZM21.9199 13.5119H32.6676V15.7678H21.9199V13.5119Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a50': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[606.45px] top-[269.50px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.45123 66.875V1.5H66.8347V66.875H1.45123Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a50': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[619.52px] top-[292.71px] absolute">

                <svg width="43" height="22" viewBox="0 0 43 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.52478 0.714905H3.55706L10.6985 18.1464H10.9452L18.0806 0.714905H21.1128V21.7148H18.7364V5.7596H18.5318L11.9679 21.7148H9.66972L3.10583 5.7596H2.90129V21.7148H0.52478V0.714905ZM32.4056 21.7148H25.9259V0.714905H32.6944C34.7339 0.714905 36.4727 1.13539 37.9226 1.97637C39.3726 2.81014 40.4856 4.00967 41.2557 5.57493C42.0318 7.13358 42.4168 9.00022 42.4168 11.1737C42.4168 13.3615 42.0258 15.2445 41.2497 16.8236C40.4676 18.396 39.3305 19.6058 37.8444 20.4534C36.3523 21.2944 34.5414 21.7148 32.4056 21.7148ZM28.4709 19.459H32.2431C33.9819 19.459 35.4198 19.1239 36.5629 18.4544C37.7 17.7842 38.5543 16.8308 39.1139 15.5934C39.6734 14.3559 39.9562 12.8827 39.9562 11.1737C39.9562 9.47846 39.6794 8.01908 39.1259 6.7955C38.5724 5.5647 37.7421 4.62144 36.6411 3.96514C35.5401 3.30222 34.1684 2.97076 32.532 2.97076H28.4709V19.459Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a52': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[673.83px] top-[269.50px] absolute">

                <svg width="69" height="68" viewBox="0 0 69 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.83472 66.875V1.5H67.2182V66.875H1.83472Z" fill="#484848" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a52': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[691.12px] top-[292.71px] absolute">

                <svg width="34" height="22" viewBox="0 0 34 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.59941 21.7148H0.119751V0.714905H6.88818C8.92172 0.714905 10.6665 1.13539 12.1165 1.97637C13.5664 2.81014 14.6794 4.00967 15.4495 5.57493C16.2196 7.13358 16.6107 9.00022 16.6107 11.1737C16.6107 13.3615 16.2196 15.2445 15.4374 16.8236C14.6613 18.396 13.5243 19.6058 12.0322 20.4534C10.5462 21.2944 8.73522 21.7148 6.59941 21.7148ZM2.65865 19.459H6.43695C8.16967 19.459 9.61363 19.1239 10.7507 18.4544C11.8938 17.7842 12.7482 16.8308 13.3077 15.5934C13.8672 14.3559 14.15 12.8827 14.15 11.1737C14.15 9.47846 13.8732 8.01908 13.3137 6.7955C12.7602 5.5647 11.936 4.62144 10.835 3.96514C9.73396 3.30222 8.36218 2.97076 6.7197 2.97076H2.65865V19.459ZM20.5875 21.7148V0.714905H33.264V2.97076H23.1264V10.0662H32.6022V12.322H23.1264V19.459H33.4264V21.7148H20.5875Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a54': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[134.77px] top-[336.88px] absolute">

                <svg width="69" height="69" viewBox="0 0 69 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.76694 67.25V1.875H67.1504V67.25H1.76694Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a54': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[150.55px] top-[360.09px] absolute">

                <svg width="36" height="22" viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.21254 21.0898H0.546082L8.25788 0.0899048H10.8834L18.5952 21.0898H15.9288L9.65308 3.41234H9.48883L3.21254 21.0898ZM4.19683 12.8869H14.9445V15.1428H4.19683V12.8869ZM20.8808 21.0898V19.2443L32.2025 2.34576H20.7575V0.0899048H35.2377V1.93549L23.9161 18.834H35.3611V21.0898H20.8808Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a56': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[202.15px] top-[336.88px] absolute">

                <svg width="68" height="69" viewBox="0 0 68 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.15039 67.25V1.875H66.5339V67.25H1.15039Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a56': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[214.62px] top-[360.09px] absolute">

                <svg width="43" height="22" viewBox="0 0 43 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.2751 0.0899048V21.0898H14.8138L3.36884 4.60162H3.16427V21.0898H0.620544V0.0899048H3.08185L14.5677 16.619H14.7729V0.0899048H17.2751ZM22.0756 0.0899048H25.1108L32.2487 17.5214H32.4947L39.6326 0.0899048H42.6678V21.0898H40.289V5.1346H40.0838L33.5205 21.0898H31.2229L24.6596 5.1346H24.4545V21.0898H22.0756V0.0899048Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a58': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[269.53px] top-[336.88px] absolute">

                <svg width="68" height="69" viewBox="0 0 68 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.53387 67.25V1.875H66.9173V67.25H1.53387Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a58': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[287.12px] top-[359.80px] absolute">

                <svg width="33" height="23" viewBox="0 0 33 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.11795 22.0899V1.08992H2.66167V11.5078H2.90776L12.342 1.08992H15.6649L6.84547 10.5645L15.6649 22.0899H12.5887L5.28663 12.3283L2.66167 15.2814V22.0899H0.11795ZM30.1541 6.33975C30.0308 5.30085 29.532 4.49415 28.6567 3.91966C27.7819 3.34576 26.708 3.05884 25.4367 3.05884C24.5066 3.05884 23.6931 3.20923 22.9958 3.51001C22.3052 3.81079 21.7655 4.22407 21.3756 4.75044C20.9924 5.27681 20.8011 5.87474 20.8011 6.54488C20.8011 7.10554 20.9346 7.5874 21.2012 7.99045C21.4749 8.38748 21.8232 8.71893 22.2474 8.98543C22.6709 9.2453 23.1156 9.46064 23.5806 9.63149C24.0451 9.79511 24.4729 9.92868 24.8621 10.0316L26.9955 10.6054C27.5424 10.7492 28.1507 10.9471 28.8209 11.2004C29.4977 11.453 30.1439 11.7983 30.7588 12.2357C31.3809 12.6664 31.8941 13.2204 32.2972 13.8972C32.7009 14.5739 32.9024 15.4041 32.9024 16.3889C32.9024 17.5234 32.6052 18.5491 32.0102 19.4646C31.4224 20.3808 30.5608 21.1087 29.4256 21.6489C28.2975 22.1891 26.9269 22.4592 25.3133 22.4592C23.8092 22.4592 22.5067 22.2162 21.4063 21.7307C20.3126 21.2459 19.451 20.5691 18.8217 19.7005C18.1996 18.8324 17.8476 17.8242 17.7658 16.6758H20.3908C20.4593 17.4687 20.7259 18.125 21.1909 18.6447C21.6626 19.1572 22.2576 19.5398 22.9754 19.7931C23.6998 20.0391 24.4795 20.1618 25.3133 20.1618C26.2844 20.1618 27.1562 20.0048 27.9287 19.6902C28.7012 19.369 29.313 18.925 29.7643 18.3572C30.2155 17.7833 30.4411 17.1131 30.4411 16.348C30.4411 15.6501 30.2462 15.0829 29.8563 14.6455C29.4671 14.2082 28.9539 13.8527 28.3185 13.5789C27.6826 13.3058 26.9955 13.0664 26.2567 12.8613L23.6727 12.1232C22.032 11.6516 20.7331 10.9778 19.7759 10.1031C18.8187 9.22784 18.3398 8.08309 18.3398 6.66821C18.3398 5.49216 18.658 4.46709 19.294 3.59181C19.9365 2.70992 20.7981 2.02655 21.878 1.54109C22.9652 1.04901 24.1787 0.802979 25.5185 0.802979C26.8722 0.802979 28.0755 1.04538 29.1283 1.53085C30.1812 2.00909 31.0157 2.6654 31.6305 3.49977C32.2526 4.33353 32.5811 5.2804 32.6154 6.33975H30.1541Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a60': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[336.92px] top-[336.88px] absolute">

                <svg width="69" height="69" viewBox="0 0 69 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.91736 67.25V1.875H67.3008V67.25H1.91736Z" fill="#484848" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a60': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[352.40px] top-[360.09px] absolute">

                <svg width="37" height="22" viewBox="0 0 37 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.06216 21.0898H0.395691L8.10748 0.0899048H10.733L18.4448 21.0898H15.7784L9.5027 3.41234H9.33845L3.06216 21.0898ZM4.04643 12.8869H14.7941V15.1428H4.04643V12.8869ZM21.4278 21.0898V0.0899048H28.5241C30.1653 0.0899048 31.5118 0.370239 32.5647 0.930895C33.6175 1.48433 34.3973 2.24649 34.9033 3.21741C35.4086 4.18773 35.6619 5.2922 35.6619 6.52902C35.6619 7.76643 35.4086 8.86371 34.9033 9.8208C34.3973 10.7779 33.6212 11.5298 32.5749 12.0767C31.5293 12.6169 30.1924 12.8869 28.565 12.8869H22.8224V10.5896H28.4832C29.6046 10.5896 30.5071 10.4259 31.1905 10.0975C31.8812 9.76964 32.38 9.30464 32.688 8.70307C33.0021 8.09489 33.1597 7.37 33.1597 6.52902C33.1597 5.68863 33.0021 4.95352 32.688 4.32489C32.3734 3.69566 31.871 3.21022 31.1803 2.86853C30.4896 2.52023 29.5769 2.34576 28.4423 2.34576H23.9709V21.0898H21.4278ZM31.3139 11.6561L36.4826 21.0898H33.5285L28.4423 11.6561H31.3139Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a62': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[404.30px] top-[336.88px] absolute">

                <svg width="68" height="69" viewBox="0 0 68 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.30078 67.25V1.875H66.6842V67.25H1.30078Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a62': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[419.23px] top-[360.09px] absolute">

                <svg width="37" height="22" viewBox="0 0 37 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.2323 2.34576V0.0899048H15.9844V2.34576H9.38022V21.0898H6.83647V2.34576H0.2323ZM36.2752 0.0899048V21.0898H33.8139L22.369 4.60162H22.1638V21.0898H19.6207V0.0899048H22.082L33.5679 16.619H33.773V0.0899048H36.2752Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a64': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[471.68px] top-[336.88px] absolute">

                <svg width="69" height="69" viewBox="0 0 69 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.68433 67.25V1.875H67.0678V67.25H1.68433Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a64': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[486.56px] top-[359.80px] absolute">

                <svg width="39" height="23" viewBox="0 0 39 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.2156 1.08992V22.0899H14.7543L3.30931 5.60164H3.10478V22.0899H0.561035V1.08992H3.02234L14.5082 17.619H14.7134V1.08992H17.2156ZM38.9167 7.65236H36.3736C36.2231 6.92086 35.9596 6.27838 35.5836 5.72434C35.2142 5.17091 34.763 4.7059 34.2299 4.32993C33.7035 3.94733 33.1187 3.66038 32.4761 3.46848C31.8336 3.27719 31.1634 3.18154 30.4661 3.18154C29.1948 3.18154 28.0427 3.50277 27.0103 4.14524C25.9845 4.78831 25.168 5.7346 24.5592 6.98585C23.9575 8.2371 23.6567 9.77166 23.6567 11.5896C23.6567 13.4081 23.9575 14.9427 24.5592 16.1939C25.168 17.4446 25.9845 18.3914 27.0103 19.0339C28.0427 19.677 29.1948 19.9982 30.4661 19.9982C31.1634 19.9982 31.8336 19.9026 32.4761 19.7107C33.1187 19.5194 33.7035 19.236 34.2299 18.8601C34.763 18.4769 35.2142 18.0089 35.5836 17.4548C35.9596 16.8948 36.2231 16.2517 36.3736 15.5274H38.9167C38.7254 16.6006 38.3764 17.5613 37.8704 18.4089C37.3644 19.2565 36.7357 19.9778 35.9837 20.5721C35.2316 21.1604 34.3869 21.608 33.4508 21.9154C32.5206 22.2234 31.5261 22.3768 30.4661 22.3768C28.675 22.3768 27.0818 21.9395 25.6872 21.0642C24.2927 20.1895 23.1953 18.9455 22.3957 17.3321C21.5955 15.7187 21.1954 13.8045 21.1954 11.5896C21.1954 9.37523 21.5955 7.46106 22.3957 5.84767C23.1953 4.23428 24.2927 2.99024 25.6872 2.11497C27.0818 1.2403 28.675 0.802979 30.4661 0.802979C31.5261 0.802979 32.5206 0.956358 33.4508 1.26436C34.3869 1.57176 35.2316 2.02293 35.9837 2.61787C36.7357 3.2056 37.3644 3.92329 37.8704 4.77089C38.3764 5.61187 38.7254 6.57256 38.9167 7.65236Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a66': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[539.07px] top-[336.88px] absolute">

                <svg width="68" height="69" viewBox="0 0 68 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.06775 67.25V1.875H66.4512V67.25H1.06775Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a66': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[554.55px] top-[359.80px] absolute">

                <svg width="37" height="23" viewBox="0 0 37 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.9345 6.33975C12.8117 5.30085 12.3124 4.49415 11.4376 3.91966C10.5622 3.34576 9.48889 3.05884 8.21703 3.05884C7.2875 3.05884 6.47408 3.20923 5.77618 3.51001C5.0861 3.81079 4.54583 4.22407 4.15597 4.75044C3.77333 5.27681 3.58202 5.87474 3.58202 6.54488C3.58202 7.10554 3.71497 7.5874 3.9821 7.99045C4.25524 8.38748 4.60421 8.71893 5.02777 8.98543C5.45192 9.2453 5.89593 9.46064 6.361 9.63149C6.82607 9.79511 7.25322 9.92868 7.64308 10.0316L9.77588 10.6054C10.3228 10.7492 10.9316 10.9471 11.6012 11.2004C12.2781 11.453 12.9242 11.7983 13.5397 12.2357C14.1618 12.6664 14.6744 13.2204 15.0781 13.8972C15.4812 14.5739 15.6828 15.4041 15.6828 16.3889C15.6828 17.5234 15.3856 18.5491 14.7905 19.4646C14.2027 20.3808 13.3412 21.1087 12.2065 21.6489C11.0784 22.1891 9.7079 22.4592 8.09431 22.4592C6.59021 22.4592 5.28767 22.2162 4.18667 21.7307C3.09289 21.2459 2.23132 20.5691 1.60261 19.7005C0.980514 18.8324 0.628567 17.8242 0.546143 16.6758H3.1717C3.24029 17.4687 3.5068 18.125 3.97126 18.6447C4.44355 19.1572 5.03797 19.5398 5.75573 19.7931C6.4807 20.0391 7.25983 20.1618 8.09431 20.1618C9.06475 20.1618 9.93653 20.0048 10.709 19.6902C11.4815 19.369 12.0934 18.925 12.5446 18.3572C12.9958 17.7833 13.2215 17.1131 13.2215 16.348C13.2215 15.6501 13.0271 15.0829 12.6373 14.6455C12.2474 14.2082 11.7348 13.8527 11.0989 13.5789C10.463 13.3058 9.77588 13.0664 9.03767 12.8613L6.45302 12.1232C4.81235 11.6516 3.51342 10.9778 2.55622 10.1031C1.59901 9.22784 1.12072 8.08309 1.12072 6.66821C1.12072 5.49216 1.4384 4.46709 2.07433 3.59181C2.71688 2.70992 3.57841 2.02655 4.65835 1.54109C5.74551 1.04901 6.95902 0.802979 8.29947 0.802979C9.65315 0.802979 10.8564 1.04538 11.9093 1.53085C12.9622 2.00909 13.796 2.6654 14.4115 3.49977C15.0336 4.33353 15.3615 5.2804 15.3958 6.33975H12.9345ZM36.4766 7.65236H33.9328C33.7824 6.92086 33.5195 6.27838 33.1435 5.72434C32.7741 5.17091 32.3229 4.7059 31.7898 4.32993C31.2634 3.94733 30.6786 3.66038 30.036 3.46848C29.3935 3.27719 28.7233 3.18154 28.026 3.18154C26.7541 3.18154 25.6026 3.50277 24.5702 4.14524C23.5444 4.78831 22.7273 5.7346 22.1191 6.98585C21.5174 8.2371 21.2166 9.77166 21.2166 11.5896C21.2166 13.4081 21.5174 14.9427 22.1191 16.1939C22.7273 17.4446 23.5444 18.3914 24.5702 19.0339C25.6026 19.677 26.7541 19.9982 28.026 19.9982C28.7233 19.9982 29.3935 19.9026 30.036 19.7107C30.6786 19.5194 31.2634 19.236 31.7898 18.8601C32.3229 18.4769 32.7741 18.0089 33.1435 17.4548C33.5195 16.8948 33.7824 16.2517 33.9328 15.5274H36.4766C36.2847 16.6006 35.9363 17.5613 35.4303 18.4089C34.9243 19.2565 34.2956 19.9778 33.5436 20.5721C32.7915 21.1604 31.9468 21.608 31.0101 21.9154C30.0806 22.2234 29.0854 22.3768 28.026 22.3768C26.2349 22.3768 24.6417 21.9395 23.2472 21.0642C21.8526 20.1895 20.7552 18.9455 19.955 17.3321C19.1554 15.7187 18.7553 13.8045 18.7553 11.5896C18.7553 9.37523 19.1554 7.46106 19.955 5.84767C20.7552 4.23428 21.8526 2.99024 23.2472 2.11497C24.6417 1.2403 26.2349 0.802979 28.026 0.802979C29.0854 0.802979 30.0806 0.956358 31.0101 1.26436C31.9468 1.57176 32.7915 2.02293 33.5436 2.61787C34.2956 3.2056 34.9243 3.92329 35.4303 4.77089C35.9363 5.61187 36.2847 6.57256 36.4766 7.65236Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a68': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[606.45px] top-[336.88px] absolute">

                <svg width="68" height="69" viewBox="0 0 68 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.45123 67.25V1.875H66.8347V67.25H1.45123Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a68': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[621.93px] top-[359.80px] absolute">

                <svg width="39" height="23" viewBox="0 0 39 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.41105 22.0899H0.931396V1.08992H7.69983C9.73336 1.08992 11.4782 1.5104 12.9281 2.35139C14.378 3.18515 15.491 4.38466 16.2611 5.94993C17.0312 7.50858 17.4223 9.37523 17.4223 11.5487C17.4223 13.7366 17.0312 15.6195 16.2491 17.1986C15.473 18.7711 14.3359 19.9808 12.8439 20.8284C11.3578 21.6694 9.54687 22.0899 7.41105 22.0899ZM3.47029 19.834H7.2486C8.98131 19.834 10.4253 19.4989 11.5624 18.8294C12.7055 18.1593 13.5598 17.2058 14.1193 15.9683C14.6789 14.7309 14.9616 13.2577 14.9616 11.5487C14.9616 9.85347 14.6849 8.39407 14.1254 7.17049C13.5718 5.9397 12.7476 4.99647 11.6466 4.34017C10.5456 3.67725 9.17382 3.34578 7.53135 3.34578H3.47029V19.834ZM38.2991 7.65236H35.7542C35.6038 6.92086 35.3391 6.27838 34.9661 5.72434C34.5931 5.17091 34.1419 4.7059 33.6124 4.32993C33.083 3.94733 32.4994 3.66038 31.8556 3.46848C31.2179 3.27719 30.5441 3.18154 29.8462 3.18154C28.5767 3.18154 27.4216 3.50277 26.3928 4.14524C25.364 4.78831 24.5517 5.7346 23.938 6.98585C23.3364 8.2371 23.0356 9.77166 23.0356 11.5896C23.0356 13.4081 23.3364 14.9427 23.938 16.1939C24.5517 17.4446 25.364 18.3914 26.3928 19.0339C27.4216 19.677 28.5767 19.9982 29.8462 19.9982C30.5441 19.9982 31.2179 19.9026 31.8556 19.7107C32.4994 19.5194 33.083 19.236 33.6124 18.8601C34.1419 18.4769 34.5931 18.0089 34.9661 17.4548C35.3391 16.8948 35.6038 16.2517 35.7542 15.5274H38.2991C38.1066 16.6006 37.7577 17.5613 37.2523 18.4089C36.7469 19.2565 36.1152 19.9778 35.3631 20.5721C34.6111 21.1604 33.7688 21.608 32.8303 21.9154C31.9037 22.2234 30.905 22.3768 29.8462 22.3768C28.0593 22.3768 26.4649 21.9395 25.0691 21.0642C23.6733 20.1895 22.5784 18.9455 21.7782 17.3321C20.978 15.7187 20.5749 13.8045 20.5749 11.5896C20.5749 9.37523 20.978 7.46106 21.7782 5.84767C22.5784 4.23428 23.6733 2.99024 25.0691 2.11497C26.4649 1.2403 28.0593 0.802979 29.8462 0.802979C30.905 0.802979 31.9037 0.956358 32.8303 1.26436C33.7688 1.57176 34.6111 2.02293 35.3631 2.61787C36.1152 3.2056 36.7469 3.92329 37.2523 4.77089C37.7577 5.61187 38.1066 6.57256 38.2991 7.65236Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a70': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[268.93px] top-[404.25px] absolute">

                <svg width="69" height="68" viewBox="0 0 69 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.93222 66.625V1.25H67.3157V66.625H1.93222Z" fill="#484848" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a70': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[283.89px] top-[427.18px] absolute">

                <svg width="39" height="22" viewBox="0 0 39 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.4327 10.9646C19.4327 13.1795 19.0326 15.0937 18.233 16.7071C17.4328 18.3205 16.3354 19.5645 14.9408 20.4392C13.5462 21.3145 11.9531 21.7518 10.162 21.7518C8.37035 21.7518 6.7778 21.3145 5.3832 20.4392C3.988 19.5645 2.89123 18.3205 2.09105 16.7071C1.29087 15.0937 0.891388 13.1795 0.891388 10.9646C0.891388 8.75023 1.29087 6.83606 2.09105 5.22267C2.89123 3.60928 3.988 2.36524 5.3832 1.48997C6.7778 0.615296 8.37035 0.177979 10.162 0.177979C11.9531 0.177979 13.5462 0.615296 14.9408 1.48997C16.3354 2.36524 17.4328 3.60928 18.233 5.22267C19.0326 6.83606 19.4327 8.75023 19.4327 10.9646ZM16.9714 10.9646C16.9714 9.14666 16.6669 7.6121 16.0587 6.36085C15.457 5.1096 14.64 4.16331 13.6076 3.52024C12.5818 2.87777 11.4333 2.55654 10.162 2.55654C8.89016 2.55654 7.73803 2.87777 6.70562 3.52024C5.68043 4.16331 4.86339 5.1096 4.25513 6.36085C3.65349 7.6121 3.35267 9.14666 3.35267 10.9646C3.35267 12.7831 3.65349 14.3177 4.25513 15.5689C4.86339 16.8196 5.68043 17.7664 6.70562 18.4089C7.73803 19.052 8.89016 19.3732 10.162 19.3732C11.4333 19.3732 12.5818 19.052 13.6076 18.4089C14.64 17.7664 15.457 16.8196 16.0587 15.5689C16.6669 14.3177 16.9714 12.7831 16.9714 10.9646ZM23.4203 21.4649V0.464918H25.9634V10.8828H26.2095L35.6444 0.464918H38.9673L30.1478 9.93953L38.9673 21.4649H35.8905L28.589 11.7033L25.9634 14.6564V21.4649H23.4203Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a72': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[336.32px] top-[404.25px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.3157 66.625V1.25H66.6992V66.625H1.3157Z" fill="#A6A6A6" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a72': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[353.90px] top-[427.46px] absolute">

                <svg width="35" height="22" viewBox="0 0 35 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.89978 21.4648V0.464905H3.44352V19.209H13.2063V21.4648H0.89978ZM19.0422 21.4648H16.3757L24.0881 0.464905H26.7131L34.4249 21.4648H31.759L25.4827 3.78734H25.3185L19.0422 21.4648ZM20.0271 13.2619H30.7741V15.5178H20.0271V13.2619Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a74': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[403.70px] top-[404.25px] absolute">

                <svg width="69" height="68" viewBox="0 0 69 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.69919 66.625V1.25H67.0827V66.625H1.69919Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a74': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[417.97px] top-[427.18px] absolute">

                <svg width="41" height="22" viewBox="0 0 41 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.974243 0.464918H4.01012L11.1473 17.8964H11.3934L18.5313 0.464918H21.5671V21.4649H19.1876V5.50961H18.9825L12.4192 21.4649H10.1222L3.55889 5.50961H3.35373V21.4649H0.974243V0.464918ZM37.8631 5.71475C37.7404 4.67585 37.241 3.86915 36.3662 3.29466C35.4908 2.72076 34.4175 2.43384 33.1457 2.43384C32.2161 2.43384 31.4027 2.58423 30.7054 2.88501C30.0147 3.18579 29.4745 3.59907 29.0846 4.12544C28.702 4.65181 28.5106 5.24974 28.5106 5.91988C28.5106 6.48054 28.6436 6.9624 28.9107 7.36545C29.1839 7.76248 29.5328 8.09393 29.9564 8.36043C30.3805 8.6203 30.8245 8.83564 31.2896 9.00649C31.7547 9.17011 32.1818 9.30368 32.5717 9.40655L34.7045 9.98043C35.2514 10.1242 35.8602 10.3221 36.5299 10.5754C37.2067 10.828 37.8529 11.1733 38.4683 11.6107C39.0904 12.0414 39.603 12.5954 40.0067 13.2722C40.4098 13.9489 40.6114 14.7791 40.6114 15.7639C40.6114 16.8984 40.3142 17.9241 39.7198 18.8396C39.1314 19.7558 38.2698 20.4837 37.1351 21.0239C36.007 21.5641 34.6365 21.8342 33.0229 21.8342C31.5188 21.8342 30.2163 21.5912 29.1159 21.1057C28.0215 20.6209 27.1605 19.9441 26.5312 19.0755C25.9091 18.2074 25.5572 17.1992 25.4748 16.0508H28.1003C28.1689 16.8437 28.4354 17.5 28.9005 18.0197C29.3722 18.5322 29.9666 18.9148 30.6843 19.1681C31.4093 19.4141 32.1884 19.5368 33.0229 19.5368C33.9933 19.5368 34.8651 19.3798 35.6376 19.0652C36.4107 18.744 37.0226 18.3 37.4738 17.7322C37.925 17.1583 38.1507 16.4881 38.1507 15.723C38.1507 15.0251 37.9557 14.4579 37.5659 14.0205C37.176 13.5832 36.6634 13.2277 36.0275 12.9539C35.3916 12.6808 34.7045 12.4414 33.9663 12.2363L31.3822 11.4982C29.741 11.0266 28.442 10.3528 27.4848 9.47811C26.5276 8.60284 26.0493 7.45809 26.0493 6.04321C26.0493 4.86716 26.367 3.84209 27.0029 2.96681C27.6455 2.08492 28.507 1.40155 29.5876 0.91609C30.6741 0.424011 31.8876 0.177979 33.2281 0.177979C34.5817 0.177979 35.785 0.420385 36.8379 0.905846C37.8908 1.38409 38.7246 2.0404 39.3401 2.87477C39.9622 3.70853 40.2901 4.6554 40.3244 5.71475H37.8631Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a76': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[471.08px] top-[404.25px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.08264 66.625V1.25H66.4661V66.625H1.08264Z" fill="#484848" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a76': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[487.76px] top-[427.46px] absolute">

                <svg width="35" height="22" viewBox="0 0 35 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.43075 21.4648H0.764282L8.47608 0.464905H11.1016L18.8134 21.4648H16.147L9.87129 3.78734H9.70704L3.43075 21.4648ZM4.41502 13.2619H15.1627V15.5178H4.41502V13.2619ZM21.7964 21.4648V0.464905H24.3395V19.209H34.1022V21.4648H21.7964Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a78': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[538.47px] top-[404.25px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.46613 66.625V1.25H66.8496V66.625H1.46613Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a78': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[553.73px] top-[427.18px] absolute">

                <svg width="39" height="22" viewBox="0 0 39 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.9036 7.02736C15.678 6.33677 15.3808 5.71835 15.0113 5.17153C14.6492 4.61749 14.2148 4.14588 13.7088 3.75607C13.2101 3.36686 12.6421 3.06909 12.0068 2.86456C11.3709 2.65943 10.6735 2.55654 9.91428 2.55654C8.67009 2.55654 7.53903 2.87777 6.51985 3.52024C5.50128 4.16331 4.69147 5.1096 4.08984 6.36085C3.4882 7.6121 3.18738 9.14666 3.18738 10.9646C3.18738 12.7831 3.49119 14.3177 4.10004 15.5689C4.7083 16.8196 5.53196 17.7664 6.57159 18.4089C7.61062 19.052 8.77959 19.3732 10.0785 19.3732C11.2818 19.3732 12.3413 19.117 13.2576 18.6038C14.1805 18.0847 14.8983 17.3532 15.4115 16.4099C15.9307 15.4595 16.1906 14.3418 16.1906 13.0568L16.9703 13.2204H10.6531V10.9646H18.6519V13.2204C18.6519 14.9499 18.2825 16.4538 17.5443 17.7322C16.8127 19.0105 15.8007 20.0019 14.509 20.7063C13.2233 21.4035 11.7469 21.7518 10.0785 21.7518C8.21887 21.7518 6.58481 21.3145 5.17637 20.4392C3.77516 19.5645 2.68139 18.3205 1.89505 16.7071C1.11533 15.0937 0.726074 13.1795 0.726074 10.9646C0.726074 9.30366 0.948061 7.80998 1.39267 6.48414C1.8439 5.15108 2.47926 4.01593 3.29989 3.0799C4.12053 2.14327 5.09093 1.42559 6.21239 0.926297C7.33384 0.427 8.56781 0.177979 9.91428 0.177979C11.0219 0.177979 12.0543 0.345189 13.0115 0.68026C13.9753 1.00811 14.8333 1.47674 15.5853 2.08492C16.3446 2.68648 16.9769 3.40775 17.4829 4.24873C17.9889 5.0825 18.3372 6.00892 18.5292 7.02736H15.9036ZM22.9319 21.4649H20.2655L27.9773 0.464918H30.6028L38.3146 21.4649H35.6482L29.3719 3.78735H29.2082L22.9319 21.4649ZM23.9162 13.262H34.6639V15.5178H23.9162V13.262Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a80': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[605.85px] top-[134.75px] absolute">

                <svg width="69" height="69" viewBox="0 0 69 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.84955 67.125V1.75H67.233V67.125H1.84955Z" fill="#484848" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a80': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[621.63px] top-[157.96px] absolute">

                <svg width="38" height="22" viewBox="0 0 38 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.2839 0.964905V21.9648H14.8232L3.38008 5.47662H3.16945V21.9648H0.630554V0.964905H3.09123L14.5766 17.494H14.7811V0.964905H17.2839ZM20.2801 0.964905H23.192L29.0159 10.7674H29.2625L35.0864 0.964905H37.9983L30.4116 13.3108V21.9648H27.8667V13.3108L20.2801 0.964905Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a82': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[673.23px] top-[134.75px] absolute">

                <svg width="68" height="69" viewBox="0 0 68 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.23303 67.125V1.75H66.6165V67.125H1.23303Z" fill="#787878" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a82': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[686.91px] top-[157.96px] absolute">

                <svg width="43" height="22" viewBox="0 0 43 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.908264 0.964905H3.94054L11.082 18.3964H11.3287L18.4641 0.964905H21.4963V21.9648H19.1199V6.0096H18.9153L12.3514 21.9648H10.0532L3.48932 6.0096H3.28478V21.9648H0.908264V0.964905ZM27.1698 21.9648H24.5045L32.2175 0.964905H34.8407L42.5536 21.9648H39.8884L33.6133 4.28734H33.4449L27.1698 21.9648ZM28.1565 13.7619H38.9017V16.0178H28.1565V13.7619Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a84': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[740.62px] top-[134.75px] absolute">

                <svg width="68" height="69" viewBox="0 0 68 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.61652 67.125V1.75H67V67.125H1.61652Z" fill="#787878" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a84': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[763.92px] top-[157.96px] absolute">

                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.917908 21.9648V0.964905H8.01124C9.65372 0.964905 11.0014 1.24524 12.0542 1.8059C13.1071 2.35933 13.8832 3.12151 14.3886 4.09243C14.9 5.06275 15.1527 6.16722 15.1527 7.40404C15.1527 8.64145 14.9 9.73869 14.3886 10.6958C13.8832 11.6529 13.1071 12.4048 12.0663 12.9516C11.0194 13.4918 9.68377 13.7619 8.05333 13.7619H2.31375V11.4646H7.96909C9.09415 11.4646 9.99661 11.3009 10.6765 10.9725C11.3683 10.6446 11.8677 10.1796 12.1745 9.57807C12.4934 8.96989 12.6499 8.24502 12.6499 7.40404C12.6499 6.56365 12.4934 5.82854 12.1745 5.19991C11.8617 4.57068 11.3623 4.0852 10.6704 3.74351C9.97855 3.39521 9.06411 3.22076 7.93303 3.22076H3.4568V21.9648H0.917908ZM10.8029 12.5311L15.9709 21.9648H13.0168L7.93303 12.5311H10.8029ZM21.6444 0.964905V21.9648H19.0994V0.964905H21.6444Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a86': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[673.23px] top-[67.38px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.23303 66.75V1.375H66.6165V66.75H1.23303Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a86': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[688.71px] top-[90.59px] absolute">

                <svg width="37" height="22" viewBox="0 0 37 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.37848 0.589905L9.61145 18.2674H9.85814L16.0971 0.589905H18.7623L11.0494 21.5898H8.42624L0.713196 0.589905H3.37848ZM20.5974 2.84576V0.589905H36.3482V2.84576H29.7422V21.5898H27.1973V2.84576H20.5974Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a88': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[740.62px] top-[67.38px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.61652 66.75V1.375H67V66.75H1.61652Z" fill="#787878" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a88': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[755.19px] top-[90.59px] absolute">

                <svg width="38" height="22" viewBox="0 0 38 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.8476 0.589905V21.5898H14.3868L2.94374 5.10162H2.73311V21.5898H0.194214V0.589905H2.65489L14.1402 17.119H14.3448V0.589905H16.8476ZM21.6486 21.5898V0.589905H24.1936V9.94119H35.39V0.589905H37.935V21.5898H35.39V12.1971H24.1936V21.5898H21.6486Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a90': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[740.62px] top-0 absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.61652 66.375V1H67V66.375H1.61652Z" fill="#787878" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a90': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[755.49px] top-[23.21px] absolute">

                <svg width="39" height="22" viewBox="0 0 39 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.494995 0.214844H3.52727L10.6687 17.6465H10.9154L18.0508 0.214844H21.083V21.2148H18.7066V5.25979H18.5021L11.9382 21.2148H9.63994L3.07605 5.25979H2.87151V21.2148H0.494995V0.214844ZM25.8961 21.2148V0.214844H38.5727V2.4707H28.4411V9.56643H37.9169V11.8223H28.4411V18.959H38.7351V21.2148H25.8961Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a92': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[404.30px] top-[67.38px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.30078 66.75V1.375H66.6842V66.75H1.30078Z" fill="#484848" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a92': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[421.16px] top-[90.59px] absolute">

                <svg width="32" height="22" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.90315 21.5898L0.160522 0.589905H2.74455L7.13411 17.6935H7.33927L11.81 0.589905H14.6817L19.153 17.6935H19.3582L23.7471 0.589905H26.3318L20.5885 21.5898H17.9636L13.328 4.85559H13.1637L8.52871 21.5898H5.90315ZM31.7549 0.589905V21.5898H29.2118V0.589905H31.7549Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a94': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-0 top-[67.38px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 66.75V1.375H66.3835V66.75H1Z" fill="#BEBEBE" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a94': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[15.18px] top-[90.59px] absolute">

                <svg width="37" height="22" viewBox="0 0 37 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.84404 21.5898H0.177704L7.88962 0.589905H10.5149L18.2268 21.5898H15.5605L9.28428 3.91233H9.12021L2.84404 21.5898ZM3.82856 13.3869H14.576V15.6428H3.82856V13.3869ZM21.2095 21.5898V0.589905H23.7527V11.0078H23.9988L33.4337 0.589905H36.7563L27.9369 10.0645L36.7563 21.5898H33.6797L26.3781 11.8283L23.7527 14.7814V21.5898H21.2095Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a96': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-0 top-[404.25px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 66.625V1.25H66.3835V66.625H1Z" fill="#BEBEBE" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a96': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[21.80px] top-[427.46px] absolute">

                <svg width="25" height="22" viewBox="0 0 25 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.795715 21.4648V0.464905H3.33896V9.81618H14.5377V0.464905H17.081V21.4648H14.5377V12.072H3.33896V21.4648H0.795715ZM24.4272 0.464905V21.4648H21.8839V0.464905H24.4272Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a98': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[269.53px] top-[471.62px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.53387 67V1.625H66.9173V67H1.53387Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a98': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[285.97px] top-[494.84px] absolute">

                <svg width="36" height="22" viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.969421 3.0957V0.839844H16.7215V3.0957H10.1173V21.8398H7.57362V3.0957H0.969421ZM21.5888 0.839844L27.0035 9.57634H27.1672L32.5819 0.839844H35.5769L28.9721 11.3395L35.5769 21.8398H32.5819L27.1672 13.2675H27.0035L21.5888 21.8398H18.5938L25.3622 11.3395L18.5938 0.839844H21.5888Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    'a100': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[606.45px] top-[471.62px] absolute">

                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.45123 67V1.625H66.8347V67H1.45123Z" fill="#EAE9E9" stroke="white" strokeWidth="2" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
    '_a100': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div className="left-[626.14px] top-[494.84px] absolute">

                <svg width="30" height="22" viewBox="0 0 30 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.142883 21.8398V0.839844H12.7352V3.0957H2.68178V10.1911H11.7906V12.447H2.68178V21.8398H0.142883ZM16.8023 21.8398V0.839844H19.3472V19.5839H29.1058V21.8398H16.8023Z" fill="black" onClick={() => onClick(state.reference)}
                        className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </svg>
            </div>
        )
    },
};


// <div className="w-[1016px] h-[678px] relative overflow-hidden">
export const US_STATES_MAP = {
    'a0': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[84.73px] top-[169.50px] absolute" />
                <div data-svg-wrapper className="left-[101.83px] top-[217.72px] absolute">
                    <svg width="42" height="19" viewBox="0 0 42 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.86612 18.3325L0.828491 0.721924H4.89476L7.80961 12.9585H7.95561L11.1708 0.721924H14.6523L17.8592 12.9842H18.0135L20.9276 0.721924H24.9939L19.9562 18.3325H16.3287L12.9759 6.81863H12.8382L9.49438 18.3325H5.86612ZM28.2484 18.3325H24.2593L30.3371 0.721924H35.1342L41.2037 18.3325H37.2146L32.8041 4.74605H32.6672L28.2484 18.3325ZM27.9987 11.4103H37.4211V14.3167H27.9987V11.4103Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a1': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[169.46px] top-[169.50px] absolute" />
                <div data-svg-wrapper className="left-[187.63px] top-[217.72px] absolute">
                    <svg width="23" height="19" viewBox="0 0 23 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.35523 0.721924V18.3325H0.633179V0.721924H4.35523ZM13.6589 18.3325H7.41761V0.721924H13.7111C15.4821 0.721924 17.0065 1.07455 18.2842 1.77979C19.5627 2.47898 20.5454 3.4854 21.2331 4.79827C21.9268 6.11038 22.2733 7.68127 22.2733 9.51021C22.2733 11.3444 21.9268 12.9206 21.2331 14.2396C20.5454 15.5577 19.5567 16.5694 18.2668 17.2747C16.983 17.9799 15.4473 18.3325 13.6589 18.3325ZM11.1404 15.1423H13.5045C14.6045 15.1423 15.5305 14.9478 16.2809 14.5574C17.0375 14.1624 17.6048 13.5517 17.9831 12.7262C18.3674 11.8946 18.5596 10.8231 18.5596 9.51021C18.5596 8.20869 18.3674 7.14553 17.9831 6.31997C17.6048 5.49442 17.0405 4.88679 16.29 4.49709C15.5388 4.10739 14.6136 3.91216 13.5129 3.91216H11.1404V15.1423Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a2': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[254.19px] top-[169.50px] absolute" />
                <div data-svg-wrapper className="left-[272.36px] top-[217.72px] absolute">
                    <svg width="37" height="19" viewBox="0 0 37 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.362915 0.721924H4.95344L9.80195 12.5544H10.0085L14.857 0.721924H19.4475V18.3325H15.8367V6.87008H15.6907L11.1342 18.2463H8.67549L4.11977 6.82697H3.97301V18.3325H0.362915V0.721924ZM21.8442 3.79185V0.721924H36.3034V3.79185H30.9133V18.3325H27.2343V3.79185H21.8442Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a3': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[338.92px] top-[169.50px] absolute" />
                <div data-svg-wrapper className="left-[357.09px] top-[217.72px] absolute">
                    <svg width="33" height="19" viewBox="0 0 33 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.8189 0.721924V18.3325H11.6037L3.94395 7.24843H3.81457V18.3325H0.0925293V0.721924H3.35916L10.9583 11.7977H11.1134V0.721924H14.8189ZM24.1353 18.3325H17.8941V0.721924H24.1868C25.9578 0.721924 27.4822 1.07455 28.7607 1.77979C30.0384 2.47898 31.0211 3.4854 31.7088 4.79827C32.4025 6.11038 32.749 7.68127 32.749 9.51021C32.749 11.3444 32.4025 12.9206 31.7088 14.2396C31.0211 15.5577 30.0324 16.5694 28.7433 17.2747C27.4595 17.9799 25.9237 18.3325 24.1353 18.3325ZM21.6161 15.1423H23.9802C25.081 15.1423 26.0062 14.9478 26.7574 14.5574C27.5139 14.1624 28.0813 13.5517 28.4596 12.7262C28.8431 11.8946 29.0353 10.8231 29.0353 9.51021C29.0353 8.20869 28.8431 7.14553 28.4596 6.31997C28.0813 5.49442 27.517 4.88679 26.7657 4.49709C26.0153 4.10739 25.0893 3.91216 23.9893 3.91216H21.6161V15.1423Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a4': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[423.65px] top-[169.50px] absolute" />
                <div data-svg-wrapper className="left-[441.82px] top-[217.72px] absolute">
                    <svg width="38" height="19" viewBox="0 0 38 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.822388 0.721924H5.41292L10.2614 12.5544H10.468L15.3165 0.721924H19.907V18.3325H16.2961V6.87008H16.1501L11.5936 18.2463H9.13496L4.57925 6.82697H4.43246V18.3325H0.822388V0.721924ZM37.7002 0.721924V18.3325H34.4851L26.8253 7.24843H26.696V18.3325H22.9739V0.721924H26.2405L33.8405 11.7977H33.9948V0.721924H37.7002Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a5': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[508.38px] top-[169.50px] absolute" />
                <div data-svg-wrapper className="left-[526.55px] top-[217.72px] absolute">
                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.27404 0.721924V18.3325H0.552002V0.721924H4.27404ZM7.33644 18.3325V0.721924H11.0592V15.2626H18.607V18.3325H7.33644Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a6': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[593.11px] top-[169.50px] absolute" />
                <div data-svg-wrapper className="left-[611.28px] top-[217.72px] absolute">
                    <svg width="27" height="19" viewBox="0 0 27 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.281738 0.721924H4.87227L9.72077 12.5544H9.92731L14.7758 0.721924H19.3663V18.3325H15.7555V6.87008H15.6095L11.053 18.2463H8.59431L4.0386 6.82697H3.89181V18.3325H0.281738V0.721924ZM26.1553 0.721924V18.3325H22.4333V0.721924H26.1553Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a7': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[84.73px] top-[254.25px] absolute" />
                <div data-svg-wrapper className="left-[102.59px] top-[302.23px] absolute">
                    <svg width="34" height="19" viewBox="0 0 34 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.0824 9.27752C17.0824 11.198 16.7185 12.8317 15.9907 14.1786C15.2682 15.5256 14.2825 16.5547 13.0335 17.2652C11.7898 17.9704 10.391 18.3231 8.83787 18.3231C7.27339 18.3231 5.86929 17.9674 4.62558 17.2569C3.38187 16.5463 2.39916 15.5172 1.67669 14.1703C0.954974 12.8226 0.594116 11.192 0.594116 9.27752C0.594116 7.35702 0.954974 5.7233 1.67669 4.37562C2.39916 3.0287 3.38187 2.00262 4.62558 1.29738C5.86929 0.586846 7.27339 0.231201 8.83787 0.231201C10.391 0.231201 11.7898 0.586846 13.0335 1.29738C14.2825 2.00262 15.2682 3.0287 15.9907 4.37562C16.7185 5.7233 17.0824 7.35702 17.0824 9.27752ZM13.3081 9.27752C13.3081 8.03351 13.122 6.98395 12.7498 6.1304C12.3829 5.27609 11.8639 4.62836 11.1937 4.18645C10.5234 3.74529 9.73812 3.52434 8.83787 3.52434C7.93837 3.52434 7.1531 3.74529 6.48283 4.18645C5.8118 4.62836 5.29057 5.27609 4.91836 6.1304C4.55145 6.98395 4.36762 8.03351 4.36762 9.27752C4.36762 10.5215 4.55145 11.5703 4.91836 12.4246C5.29057 13.2789 5.8118 13.9267 6.48283 14.3678C7.1531 14.809 7.93837 15.0299 8.83787 15.0299C9.73812 15.0299 10.5234 14.809 11.1937 14.3678C11.8639 13.9267 12.3829 13.2789 12.7498 12.4246C13.122 11.5703 13.3081 10.5215 13.3081 9.27752ZM19.8399 18.0824V0.471825H26.7862C28.1154 0.471825 29.2502 0.710203 30.1905 1.18541C31.1361 1.65607 31.8556 2.32346 32.3481 3.18912C32.8466 4.04949 33.0963 5.06119 33.0963 6.22499C33.0963 7.39408 32.8436 8.40049 32.3398 9.2427C31.8352 10.0796 31.1044 10.7221 30.1474 11.1693C29.1957 11.6165 28.0443 11.8397 26.6916 11.8397H22.0406V8.84696H26.0894C26.8006 8.84696 27.3906 8.75009 27.8604 8.55486C28.3302 8.36039 28.6805 8.06755 28.9097 7.67785C29.1442 7.28815 29.2623 6.80386 29.2623 6.22499C29.2623 5.64006 29.1442 5.1467 28.9097 4.74565C28.6805 4.34461 28.328 4.04042 27.8521 3.83385C27.3823 3.62197 26.7892 3.51602 26.0728 3.51602H23.5619V18.0824H19.8399ZM29.3477 10.0683L33.7234 18.0824H29.614L25.3329 10.0683H29.3477Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a8': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[169.46px] top-[254.25px] absolute" />
                <div data-svg-wrapper className="left-[187.63px] top-[302.47px] absolute">
                    <svg width="33" height="19" viewBox="0 0 33 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.5081 0.471924H15.2301V11.9086C15.2301 13.1928 14.9237 14.3165 14.3102 15.279C13.7027 16.2423 12.8517 16.9937 11.757 17.5324C10.6623 18.0651 9.38759 18.3322 7.9313 18.3322C6.47046 18.3322 5.19195 18.0651 4.09727 17.5324C3.00259 16.9937 2.15151 16.2423 1.54403 15.279C0.936549 14.3165 0.633179 13.1928 0.633179 11.9086V0.471924H4.35523V11.5901C4.35523 12.2613 4.50124 12.8575 4.79401 13.3789C5.09208 13.9003 5.51044 14.3104 6.04908 14.6085C6.58772 14.9067 7.21488 15.0557 7.9313 15.0557C8.65377 15.0557 9.28166 14.9067 9.81425 14.6085C10.3529 14.3104 10.7682 13.9003 11.061 13.3789C11.3591 12.8575 11.5081 12.2613 11.5081 11.5901V0.471924ZM17.6223 3.54185V0.471924H32.0823V3.54185H26.6921V18.0825H23.0124V3.54185H17.6223Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a9': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[254.19px] top-[254.25px] absolute" />
                <div data-svg-wrapper className="left-[271.29px] top-[302.47px] absolute">
                    <svg width="42" height="19" viewBox="0 0 42 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.32547 18.0825L0.287842 0.471924H4.35411L7.26896 12.7085H7.41499L10.6302 0.471924H14.1117L17.3185 12.7342H17.4728L20.387 0.471924H24.4532L19.4156 18.0825H15.7881L12.4352 6.56863H12.2975L8.95374 18.0825H5.32547ZM25.414 0.471924H29.5839L33.5987 8.0563H33.7705L37.7853 0.471924H41.9544L35.5324 11.8572V18.0825H31.836V11.8572L25.414 0.471924Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a10': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[338.92px] top-[254.25px] absolute" />
                <div data-svg-wrapper className="left-[356.53px] top-[302.23px] absolute">
                    <svg width="32" height="19" viewBox="0 0 32 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.6436 5.53641C10.5748 4.84328 10.2797 4.3045 9.7577 3.9201C9.23647 3.53645 8.52839 3.34426 7.63418 3.34426C7.0267 3.34426 6.51376 3.42977 6.09541 3.6023C5.67706 3.76801 5.35632 4.00031 5.13314 4.29844C4.91527 4.59658 4.80632 4.93483 4.80632 5.31318C4.79498 5.62872 4.86078 5.9034 5.00377 6.13874C5.1528 6.37407 5.35631 6.57687 5.61428 6.7494C5.87225 6.91511 6.17032 7.0619 6.50848 7.18751C6.84665 7.30782 7.20751 7.41149 7.59182 7.49699L9.17367 7.87534C9.94154 8.04787 10.6466 8.27717 11.2881 8.5632C11.9297 8.84999 12.4857 9.20259 12.9562 9.62105C13.426 10.0395 13.7899 10.5329 14.0479 11.1004C14.3112 11.6679 14.4458 12.3187 14.4519 13.0519C14.4458 14.1302 14.1712 15.064 13.6265 15.8555C13.0879 16.6409 12.3079 17.2516 11.2881 17.6867C10.2737 18.1165 9.05038 18.3321 7.61754 18.3321C6.19605 18.3321 4.95839 18.1142 3.90381 17.6784C2.85452 17.2425 2.03521 16.5978 1.44513 15.7435C0.860346 14.8839 0.553955 13.82 0.525208 12.5532H4.12697C4.16706 13.1435 4.33651 13.6368 4.63458 14.0326C4.93794 14.4223 5.34194 14.7174 5.84653 14.9179C6.35643 15.1131 6.93213 15.2108 7.57441 15.2108C8.20459 15.2108 8.75229 15.1185 9.21604 14.9353C9.68659 14.7515 10.0505 14.4964 10.3084 14.1703C10.5657 13.8434 10.695 13.4681 10.695 13.0436C10.695 12.6478 10.5778 12.3157 10.3425 12.0463C10.1133 11.7769 9.77511 11.5476 9.32801 11.3584C8.88696 11.1693 8.34529 10.9967 7.70301 10.8424L5.786 10.3604C4.30172 9.99941 3.12987 9.43491 2.27047 8.66686C1.41031 7.89881 0.983638 6.86364 0.988933 5.56288C0.983638 4.49594 1.26733 3.56444 1.84001 2.76764C2.4195 1.97084 3.2131 1.34885 4.22153 0.901647C5.22997 0.455196 6.37684 0.231201 7.66064 0.231201C8.96714 0.231201 10.1072 0.455196 11.0816 0.901647C12.0621 1.34885 12.8239 1.97084 13.3686 2.76764C13.9133 3.56444 14.1939 4.48763 14.2113 5.53641H10.6436ZM23.1964 18.0824H16.9552V0.471825H23.2486C25.0197 0.471825 26.544 0.824454 27.8218 1.5297C29.1003 2.22888 30.083 3.2353 30.7707 4.54817C31.4644 5.86028 31.8109 7.43117 31.8109 9.26011C31.8109 11.0943 31.4644 12.6705 30.7707 13.9895C30.083 15.3076 29.0942 16.3193 27.8044 17.0246C26.5206 17.7298 24.9849 18.0824 23.1964 18.0824ZM20.678 14.8922H23.0421C24.1421 14.8922 25.0681 14.6977 25.8185 14.3073C26.575 13.9123 27.1424 13.3016 27.5207 12.4761C27.905 11.6445 28.0972 10.573 28.0972 9.26011C28.0972 7.95859 27.905 6.89543 27.5207 6.06987C27.1424 5.24432 26.5781 4.63669 25.8276 4.24699C25.0764 3.8573 24.1512 3.66206 23.0504 3.66206H20.678V14.8922Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a11': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[423.65px] top-[254.25px] absolute" />
                <div data-svg-wrapper className="left-[441.82px] top-[302.47px] absolute">
                    <svg width="24" height="19" viewBox="0 0 24 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.54443 0.471924V18.0825H0.822388V0.471924H4.54443ZM10.6419 18.0825H6.65283L12.7307 0.471924H17.5277L23.5973 18.0825H19.6082L15.1984 4.49605H15.0607L10.6419 18.0825ZM10.3923 11.1603H19.8147V14.0667H10.3923V11.1603Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a12': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[508.38px] top-[254.25px] absolute" />
                <div data-svg-wrapper className="left-[526.55px] top-[302.47px] absolute">
                    <svg width="23" height="19" viewBox="0 0 23 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.27404 0.471924V18.0825H0.552002V0.471924H4.27404ZM22.0627 0.471924V18.0825H18.8475L11.1878 6.99843H11.0592V18.0825H7.33644V0.471924H10.6038L18.203 11.5477H18.3581V0.471924H22.0627Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a13': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[593.11px] top-[254.25px] absolute" />
                <div data-svg-wrapper className="left-[610.97px] top-[302.23px] absolute">
                    <svg width="36" height="19" viewBox="0 0 36 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.4605 9.27752C17.4605 11.198 17.0966 12.8317 16.3689 14.1786C15.6464 15.5256 14.6607 16.5547 13.4117 17.2652C12.168 17.9704 10.7691 18.3231 9.21602 18.3231C7.65154 18.3231 6.24746 17.9674 5.00374 17.2569C3.76003 16.5463 2.77731 15.5172 2.05484 14.1703C1.33312 12.8226 0.97229 11.192 0.97229 9.27752C0.97229 7.35702 1.33312 5.7233 2.05484 4.37562C2.77731 3.0287 3.76003 2.00262 5.00374 1.29738C6.24746 0.586846 7.65154 0.231201 9.21602 0.231201C10.7691 0.231201 12.168 0.586846 13.4117 1.29738C14.6607 2.00262 15.6464 3.0287 16.3689 4.37562C17.0966 5.7233 17.4605 7.35702 17.4605 9.27752ZM13.6863 9.27752C13.6863 8.03351 13.5002 6.98395 13.128 6.1304C12.7611 5.27609 12.2421 4.62836 11.5718 4.18645C10.9015 3.74529 10.1163 3.52434 9.21602 3.52434C8.31652 3.52434 7.53127 3.74529 6.861 4.18645C6.18997 4.62836 5.66874 5.27609 5.29653 6.1304C4.92962 6.98395 4.74577 8.03351 4.74577 9.27752C4.74577 10.5215 4.92962 11.5703 5.29653 12.4246C5.66874 13.2789 6.18997 13.9267 6.861 14.3678C7.53127 14.809 8.31652 15.0299 9.21602 15.0299C10.1163 15.0299 10.9015 14.809 11.5718 14.3678C12.2421 13.9267 12.7611 13.2789 13.128 12.4246C13.5002 11.5703 13.6863 10.5215 13.6863 9.27752ZM20.218 18.0824V0.471825H23.9401V7.73838H31.4969V0.471825H35.2107V18.0824H31.4969V10.8075H23.9401V18.0824H20.218Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a14': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[677.84px] top-[254.25px] absolute" />
                <div data-svg-wrapper className="left-[696.01px] top-[302.47px] absolute">
                    <svg width="30" height="19" viewBox="0 0 30 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.0114746 18.0825V0.471924H6.9578C8.29305 0.471924 9.43008 0.726949 10.3704 1.23772C11.31 1.74168 12.0264 2.44389 12.5197 3.34436C13.0182 4.23877 13.2671 5.27015 13.2671 6.44001C13.2671 7.6091 13.0152 8.64122 12.5106 9.53563C12.0068 10.4293 11.276 11.1262 10.319 11.6249C9.3673 12.1235 8.21513 12.3732 6.86324 12.3732H2.43533V9.38883H6.26104C6.97746 9.38883 7.56754 9.26551 8.03204 9.01958C8.50184 8.76685 8.85134 8.42028 9.08056 7.97912C9.31584 7.53192 9.4331 7.01888 9.4331 6.44001C9.4331 5.85508 9.31584 5.34506 9.08056 4.9092C8.85134 4.46805 8.50184 4.12679 8.03204 3.88616C7.56225 3.63947 6.9661 3.51612 6.24363 3.51612H3.73352V18.0825H0.0114746ZM16.6866 18.0825H12.6983L18.7761 0.471924H23.5732L29.6419 18.0825H25.6536L21.2431 4.49605H21.1054L16.6866 18.0825ZM16.4377 11.1603H25.8593V14.0667H16.4377V11.1603Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a15': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[762.57px] top-[254.25px] absolute" />
                <div data-svg-wrapper className="left-[780.74px] top-[302.47px] absolute">
                    <svg width="30" height="19" viewBox="0 0 30 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.4683 0.471924V18.0825H12.2531L4.58959 6.99843H4.46095V18.0825H0.738953V0.471924H4.00706L11.6101 11.5477H11.7613V0.471924H15.4683ZM25.5905 0.471924H29.2747V12.7516C29.2747 13.8866 29.0175 14.8726 28.503 15.7095C28.0037 16.5464 27.3001 17.1912 26.3999 17.6437C25.4996 18.0969 24.4557 18.3232 23.2604 18.3232C22.2013 18.3232 21.2405 18.137 20.3705 17.7647C19.5156 17.3864 18.8348 16.8128 18.3279 16.0448C17.8211 15.2706 17.5714 14.299 17.579 13.1299H21.2859C21.2935 13.5938 21.3918 13.9926 21.5658 14.3248C21.755 14.6517 22.0046 14.9036 22.3148 15.0815C22.6401 15.2532 23.0183 15.3395 23.4496 15.3395C23.911 15.3395 24.2968 15.2419 24.6145 15.0474C24.9323 14.8461 25.1744 14.554 25.3408 14.1704C25.5073 13.786 25.5905 13.3131 25.5905 12.7516V0.471924Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a16': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[847.30px] top-[254.25px] absolute" />
                <div data-svg-wrapper className="left-[865.16px] top-[302.23px] absolute">
                    <svg width="33" height="19" viewBox="0 0 33 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.0074 6.6374H12.2399C12.1718 6.15008 12.0281 5.71725 11.8163 5.3389C11.6045 4.95526 11.3321 4.62838 10.9992 4.35899C10.6664 4.08961 10.2882 3.88303 9.84939 3.73926C9.41818 3.59624 8.94906 3.52434 8.44976 3.52434C7.53438 3.52434 6.74011 3.75135 6.06681 4.20386C5.39352 4.65106 4.8639 5.30485 4.4932 6.16446C4.12251 7.01877 3.93339 8.05621 3.93339 9.27752C3.93339 10.5329 4.12251 11.5877 4.4932 12.4413C4.87146 13.2956 5.40109 13.941 6.07439 14.3761C6.75525 14.812 7.53444 15.0299 8.41957 15.0299C8.91887 15.0299 9.38031 14.9641 9.80396 14.8324C10.2352 14.7 10.621 14.5085 10.9539 14.2558C11.2792 13.9978 11.5591 13.6853 11.7785 13.319C11.9978 12.952 12.1567 12.5336 12.2399 12.0629L16.0074 12.0803C15.9091 12.8885 15.6669 13.6686 15.2735 14.4193C14.8877 15.1646 14.3733 15.8328 13.7152 16.423C13.0721 17.0079 12.3004 17.4718 11.4002 17.8161C10.4999 18.1543 9.49376 18.3231 8.35899 18.3231C6.793 18.3231 5.38593 17.9674 4.15281 17.2569C2.91969 16.5463 1.94379 15.5172 1.2251 14.1703C0.513974 12.8226 0.158386 11.192 0.158386 9.27752C0.158386 7.35702 0.521562 5.7233 1.24782 4.37562C1.96651 3.0287 2.94998 2.00262 4.1831 1.29738C5.42378 0.586846 6.81569 0.231201 8.35899 0.231201C9.38028 0.231201 10.3259 0.374212 11.1959 0.661C12.0735 0.947788 12.8527 1.36624 13.526 1.91636C14.2069 2.46118 14.7591 3.12935 15.1828 3.9201C15.6064 4.7116 15.8864 5.61737 16.0074 6.6374ZM18.0046 3.54175V0.471825H32.4616V3.54175H27.0752V18.0824H23.3909V3.54175H18.0046Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a17': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[84.73px] top-[339px] absolute" />
                <div data-svg-wrapper className="left-[102.59px] top-[386.98px] absolute">
                    <svg width="35" height="20" viewBox="0 0 35 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.4378 7.38764H12.6726C12.6038 6.90033 12.4631 6.46749 12.2513 6.08915C12.0387 5.7055 11.7671 5.37862 11.4342 5.10924C11.1021 4.83985 10.7178 4.63325 10.2821 4.48948C9.85235 4.34646 9.38558 4.27458 8.88098 4.27458C7.97014 4.27458 7.1758 4.5016 6.49947 4.9541C5.82391 5.40131 5.29889 6.0551 4.92668 6.9147C4.55372 7.76901 4.36762 8.80646 4.36762 10.0278C4.36762 11.2831 4.55372 12.3379 4.92668 13.1915C5.30494 14.0458 5.83223 14.6913 6.50856 15.1264C7.18488 15.5622 7.96711 15.7802 8.85526 15.7802C9.35381 15.7802 9.81528 15.7143 10.2397 15.5827C10.6694 15.4503 11.0507 15.2588 11.3828 15.0061C11.7149 14.748 11.9903 14.4355 12.2081 14.0693C12.4313 13.7023 12.5864 13.2838 12.6726 12.8131L16.4378 12.8306C16.3402 13.6387 16.0966 14.4189 15.707 15.1695C15.3227 15.9148 14.8045 16.583 14.1509 17.1732C13.5033 17.7582 12.7294 18.222 11.8299 18.5663C10.9357 18.9046 9.92422 19.0733 8.7955 19.0733C7.22498 19.0733 5.82088 18.7177 4.58247 18.0071C3.35086 17.2966 2.37646 16.2675 1.66004 14.9206C0.948919 13.5729 0.594116 11.9422 0.594116 10.0278C0.594116 8.10727 0.954974 6.47354 1.67669 5.12586C2.39916 3.77894 3.37886 2.75287 4.61727 2.04763C5.85493 1.33709 7.24767 0.981445 8.7955 0.981445C9.81528 0.981445 10.7609 1.12446 11.6324 1.41124C12.5092 1.69803 13.2854 2.11648 13.9617 2.6666C14.6381 3.21142 15.1881 3.87959 15.6125 4.67034C16.0422 5.46184 16.3175 6.36761 16.4378 7.38764ZM21.8106 18.8327H17.8215L23.8993 1.22207H28.6964L34.7659 18.8327H30.7768L26.3671 5.24618H26.2294L21.8106 18.8327ZM21.5617 11.9104H30.9833V14.8169H21.5617V11.9104Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a18': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[169.46px] top-[339px] absolute" />
                <div data-svg-wrapper className="left-[187.63px] top-[387.22px] absolute">
                    <svg width="35" height="18" viewBox="0 0 35 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.3595 0.221924V17.8325H12.1443L4.4846 6.74843H4.35523V17.8325H0.633179V0.221924H3.89982L11.499 11.2977H11.6541V0.221924H15.3595ZM21.6159 0.221924L25.8713 13.6018H26.0339L30.2984 0.221924H34.4245L28.3557 17.8325H23.5586L17.4808 0.221924H21.6159Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a19': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[254.19px] top-[339px] absolute" />
                <div data-svg-wrapper className="left-[272.05px] top-[386.98px] absolute">
                    <svg width="35" height="20" viewBox="0 0 35 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.8972 7.38764H12.132C12.0631 6.90033 11.9224 6.46749 11.7106 6.08915C11.498 5.7055 11.2264 5.37862 10.8936 5.10924C10.5614 4.83985 10.1772 4.63325 9.7414 4.48948C9.3117 4.34646 8.84492 4.27458 8.34032 4.27458C7.42948 4.27458 6.63515 4.5016 5.95883 4.9541C5.28326 5.40131 4.75823 6.0551 4.38602 6.9147C4.01306 7.76901 3.82695 8.80646 3.82695 10.0278C3.82695 11.2831 4.01306 12.3379 4.38602 13.1915C4.76428 14.0458 5.29157 14.6913 5.9679 15.1264C6.64422 15.5622 7.42645 15.7802 8.3146 15.7802C8.81314 15.7802 9.27463 15.7143 9.69904 15.5827C10.1287 15.4503 10.51 15.2588 10.8421 15.0061C11.1742 14.748 11.4496 14.4355 11.6675 14.0693C11.8907 13.7023 12.0457 13.2838 12.132 12.8131L15.8972 12.8306C15.7996 13.6387 15.556 14.4189 15.1664 15.1695C14.7821 15.9148 14.2638 16.583 13.6102 17.1732C12.9626 17.7582 12.1887 18.222 11.2892 18.5663C10.395 18.9046 9.38355 19.0733 8.25483 19.0733C6.6843 19.0733 5.28021 18.7177 4.0418 18.0071C2.81019 17.2966 1.83581 16.2675 1.11939 14.9206C0.40827 13.5729 0.0534668 11.9422 0.0534668 10.0278C0.0534668 8.10727 0.414324 6.47354 1.13604 5.12586C1.85851 3.77894 2.83819 2.75287 4.07661 2.04763C5.31427 1.33709 6.707 0.981445 8.25483 0.981445C9.27461 0.981445 10.2203 1.12446 11.0918 1.41124C11.9686 1.69803 12.7448 2.11648 13.4211 2.6666C14.0974 3.21142 14.6474 3.87959 15.0718 4.67034C15.5015 5.46184 15.7769 6.36761 15.8972 7.38764ZM34.7457 10.0278C34.7457 11.9483 34.3819 13.582 33.6533 14.9289C32.9316 16.2758 31.9459 17.3049 30.6961 18.0154C29.4524 18.7207 28.0544 19.0733 26.5012 19.0733C24.9368 19.0733 23.5327 18.7177 22.289 18.0071C21.0453 17.2966 20.0625 16.2675 19.3401 14.9206C18.6176 13.5729 18.2567 11.9422 18.2567 10.0278C18.2567 8.10727 18.6176 6.47354 19.3401 5.12586C20.0625 3.77894 21.0453 2.75287 22.289 2.04763C23.5327 1.33709 24.9368 0.981445 26.5012 0.981445C28.0544 0.981445 29.4524 1.33709 30.6961 2.04763C31.9459 2.75287 32.9316 3.77894 33.6533 5.12586C34.3819 6.47354 34.7457 8.10727 34.7457 10.0278ZM30.9715 10.0278C30.9715 8.78375 30.7854 7.73422 30.4124 6.88067C30.0455 6.02636 29.5273 5.3786 28.857 4.93669C28.186 4.49554 27.4007 4.27458 26.5012 4.27458C25.601 4.27458 24.8165 4.49554 24.1454 4.93669C23.4752 5.3786 22.9532 6.02636 22.581 6.88067C22.2141 7.73422 22.031 8.78375 22.031 10.0278C22.031 11.2718 22.2141 12.3206 22.581 13.1749C22.9532 14.0292 23.4752 14.6769 24.1454 15.1181C24.8165 15.5592 25.601 15.7802 26.5012 15.7802C27.4007 15.7802 28.186 15.5592 28.857 15.1181C29.5273 14.6769 30.0455 14.0292 30.4124 13.1749C30.7854 12.3206 30.9715 11.2718 30.9715 10.0278Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a20': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[338.92px] top-[339px] absolute" />
                <div data-svg-wrapper className="left-[357.09px] top-[387.22px] absolute">
                    <svg width="30" height="18" viewBox="0 0 30 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.8189 0.221924V17.8325H11.6037L3.94395 6.74843H3.81457V17.8325H0.0925293V0.221924H3.35916L10.9583 11.2977H11.1134V0.221924H14.8189ZM17.8941 17.8325V0.221924H29.7577V3.29185H21.6161V7.4885H29.1472V10.5576H21.6161V14.7626H29.7918V17.8325H17.8941Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a21': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[423.65px] top-[339px] absolute" />
                <div data-svg-wrapper className="left-[441.82px] top-[386.98px] absolute">
                    <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.822388 1.22207H5.41292L10.2614 13.0545H10.468L15.3165 1.22207H19.907V18.8327H16.2961V7.37023H16.1501L11.5936 18.7464H9.13496L4.57925 7.32709H4.43246V18.8327H0.822388V1.22207ZM39.1527 10.0278C39.1527 11.9483 38.7889 13.582 38.0611 14.9289C37.3394 16.2758 36.3536 17.3049 35.1039 18.0154C33.8602 18.7207 32.4621 19.0733 30.909 19.0733C29.3438 19.0733 27.9397 18.7177 26.696 18.0071C25.4522 17.2966 24.4696 16.2675 23.7478 14.9206C23.0254 13.5729 22.6645 11.9422 22.6645 10.0278C22.6645 8.10727 23.0254 6.47354 23.7478 5.12586C24.4696 3.77894 25.4522 2.75287 26.696 2.04763C27.9397 1.33709 29.3438 0.981445 30.909 0.981445C32.4621 0.981445 33.8602 1.33709 35.1039 2.04763C36.3536 2.75287 37.3394 3.77894 38.0611 5.12586C38.7889 6.47354 39.1527 8.10727 39.1527 10.0278ZM35.3793 10.0278C35.3793 8.78375 35.1924 7.73422 34.8202 6.88067C34.4533 6.02636 33.9351 5.3786 33.264 4.93669C32.5938 4.49554 31.8085 4.27458 30.909 4.27458C30.0088 4.27458 29.2235 4.49554 28.5532 4.93669C27.8829 5.3786 27.361 6.02636 26.9887 6.88067C26.6218 7.73422 26.4387 8.78375 26.4387 10.0278C26.4387 11.2718 26.6218 12.3206 26.9887 13.1749C27.361 14.0292 27.8829 14.6769 28.5532 15.1181C29.2235 15.5592 30.0088 15.7802 30.909 15.7802C31.8085 15.7802 32.5938 15.5592 33.264 15.1181C33.9351 14.6769 34.4533 14.0292 34.8202 13.1749C35.1924 12.3206 35.3793 11.2718 35.3793 10.0278Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a22': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[508.38px] top-[339px] absolute" />
                <div data-svg-wrapper className="left-[526.55px] top-[387.22px] absolute">
                    <svg width="33" height="18" viewBox="0 0 33 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.552002 17.8325V0.221924H4.27404V7.98716H4.5063L10.8421 0.221924H15.3041L8.77001 8.10747L15.3812 17.8325H10.9284L6.10558 10.5925L4.27404 12.8277V17.8325H0.552002ZM16.2111 0.221924H20.3802L24.3951 7.8063H24.5668L28.5816 0.221924H32.7508L26.3295 11.6072V17.8325H22.6324V11.6072L16.2111 0.221924Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a23': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[593.11px] top-[339px] absolute" />
                <div data-svg-wrapper className="left-[610.21px] top-[387.22px] absolute">
                    <svg width="43" height="18" viewBox="0 0 43 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.24436 17.8325L0.206726 0.221924H4.273L7.18787 12.4585H7.33387L10.5491 0.221924H14.0305L17.2374 12.4842H17.3917L20.3058 0.221924H24.3721L19.3345 17.8325H15.707L12.3541 6.31863H12.2164L8.87262 17.8325H5.24436ZM29.5459 0.221924L33.8013 13.6018H33.964L38.2285 0.221924H42.3545L36.2857 17.8325H31.4887L25.4108 0.221924H29.5459Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a24': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[677.84px] top-[339px] absolute" />
                <div data-svg-wrapper className="left-[695.06px] top-[387.22px] absolute">
                    <svg width="33" height="18" viewBox="0 0 33 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.19194 0.221924L8.44734 13.6018H8.61075L12.8752 0.221924H17.0013L10.9317 17.8325H6.13466L0.0568237 0.221924H4.19194ZM19.8147 17.8325H15.8256L21.9035 0.221924H26.7005L32.7701 17.8325H28.7809L24.3712 4.24603H24.2335L19.8147 17.8325ZM19.5651 10.9103H28.9875V13.8167H19.5651V10.9103Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a25': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[762.57px] top-[339px] absolute" />
                <div data-svg-wrapper className="left-[780.74px] top-[387.22px] absolute">
                    <svg width="38" height="18" viewBox="0 0 38 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.738953 0.221924H5.33096L10.1802 12.0544H10.3845L15.2338 0.221924H19.8258V17.8325H16.2172V6.37008H16.066L11.5117 17.7463H9.05305L4.49881 6.32695H4.35512V17.8325H0.738953V0.221924ZM29.131 17.8325H22.8897V0.221924H29.1839C30.9541 0.221924 32.4823 0.574552 33.7609 1.27979C35.0394 1.97898 36.0228 2.9854 36.7112 4.29827C37.3996 5.61038 37.7476 7.18127 37.7476 9.01021C37.7476 10.8444 37.3996 12.4206 36.7112 13.7396C36.0228 15.0577 35.0318 16.0694 33.7381 16.7747C32.4596 17.4799 30.9239 17.8325 29.131 17.8325ZM26.6117 14.6423H28.9796C30.0766 14.6423 31.0071 14.4478 31.7561 14.0574C32.5126 13.6624 33.08 13.0517 33.4582 12.2262C33.8441 11.3946 34.0332 10.3231 34.0332 9.01021C34.0332 7.70869 33.8441 6.64553 33.4582 5.81997C33.08 4.99442 32.5126 4.38679 31.7636 3.99709C31.0147 3.60739 30.0917 3.41216 28.9872 3.41216H26.6117V14.6423Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a26': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[847.30px] top-[339px] absolute" />
                <div data-svg-wrapper className="left-[865.47px] top-[387.22px] absolute">
                    <svg width="30" height="18" viewBox="0 0 30 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.70982 17.8325H0.468567V0.221924H6.76273C8.53298 0.221924 10.0612 0.574552 11.3397 1.27979C12.6182 1.97898 13.6017 2.9854 14.2825 4.29827C14.9785 5.61038 15.3265 7.18127 15.3265 9.01021C15.3265 10.8444 14.9785 12.4206 14.2825 13.7396C13.6017 15.0577 12.6106 16.0694 11.317 16.7747C10.0385 17.4799 8.50276 17.8325 6.70982 17.8325ZM4.19056 14.6423H6.55846C7.65541 14.6423 8.58595 14.4478 9.3349 14.0574C10.0914 13.6624 10.6588 13.0517 11.0371 12.2262C11.4229 11.3946 11.612 10.3231 11.612 9.01021C11.612 7.70869 11.4229 6.64553 11.0371 5.81997C10.6588 4.99442 10.0914 4.38679 9.34248 3.99709C8.59353 3.60739 7.66298 3.41216 6.56603 3.41216H4.19056V14.6423ZM18.0803 17.8325V0.221924H29.9499V3.29185H21.8023V7.4885H29.3372V10.5576H21.8023V14.7626H29.9802V17.8325H18.0803Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a27': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[169.46px] top-[423.75px] absolute" />
                <div data-svg-wrapper className="left-[186.68px] top-[471.97px] absolute">
                    <svg width="34" height="19" viewBox="0 0 34 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.66757 18.5825H0.678467L6.75631 0.971924H11.5534L17.6229 18.5825H13.6338L9.22407 4.99603H9.08638L4.66757 18.5825ZM4.41868 11.6603H13.8403V14.5667H4.41868V11.6603ZM19.5528 18.5825V16.373L28.3389 4.04185H19.5361V0.971924H33.0157V3.18225L24.2212 15.5126H33.0324V18.5825H19.5528Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a28': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[254.19px] top-[423.75px] absolute" />
                <div data-svg-wrapper className="left-[272.36px] top-[471.97px] absolute">
                    <svg width="38" height="19" viewBox="0 0 38 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.0892 0.971924V18.5825H11.8741L4.21434 7.49843H4.08496V18.5825H0.362915V0.971924H3.62954L11.2287 12.0477H11.3838V0.971924H15.0892ZM18.1645 0.971924H22.755L27.6035 12.8044H27.81L32.6586 0.971924H37.2491V18.5825H33.639V7.12008H33.4922L28.9365 18.4963H26.4778L21.9213 7.07695H21.7753V18.5825H18.1645V0.971924Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a29': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[338.92px] top-[423.75px] absolute" />
                <div data-svg-wrapper className="left-[357.09px] top-[471.73px] absolute">
                    <svg width="30" height="19" viewBox="0 0 30 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.0925293 18.5827V0.97207H3.81457V8.73731H4.04683L10.3826 0.97207H14.8446L8.31054 8.85762L14.9217 18.5827H10.4689L5.64611 11.3426L3.81457 13.5779V18.5827H0.0925293ZM26.1923 6.03663C26.1235 5.3435 25.8284 4.80474 25.3064 4.42034C24.7852 4.0367 24.0771 3.8445 23.1829 3.8445C22.5754 3.8445 22.0625 3.93001 21.6441 4.10254C21.2258 4.26826 20.905 4.50055 20.6819 4.79869C20.464 5.09683 20.355 5.43507 20.355 5.81342C20.3437 6.12896 20.4095 6.40365 20.5525 6.63898C20.7015 6.87431 20.905 7.07711 21.163 7.24964C21.421 7.41536 21.719 7.56214 22.0572 7.68775C22.3954 7.80806 22.7562 7.91173 23.1405 7.99724L24.7224 8.37558C25.4902 8.54811 26.1953 8.77739 26.8369 9.06342C27.4784 9.35021 28.0344 9.70284 28.505 10.1213C28.9748 10.5397 29.3387 11.0331 29.5966 11.6006C29.8599 12.1682 29.9946 12.8189 30.0006 13.5521C29.9946 14.6304 29.7199 15.5642 29.1752 16.3557C28.6366 17.1412 27.8566 17.7518 26.8369 18.1869C25.8224 18.6167 24.5991 18.8324 23.1662 18.8324C21.7448 18.8324 20.5071 18.6145 19.4525 18.1786C18.4032 17.7427 17.5839 17.098 16.9938 16.2437C16.4091 15.3841 16.1027 14.3202 16.0739 13.0535H19.6757C19.7158 13.6437 19.8852 14.1371 20.1833 14.5328C20.4867 14.9225 20.8906 15.2176 21.3952 15.4182C21.9051 15.6134 22.4808 15.711 23.1231 15.711C23.7533 15.711 24.301 15.6187 24.7647 15.4356C25.2353 15.2517 25.5992 14.9967 25.8572 14.6706C26.1144 14.3437 26.2437 13.9683 26.2437 13.5438C26.2437 13.1481 26.1265 12.8159 25.8912 12.5465C25.662 12.2771 25.3238 12.0479 24.8767 11.8587C24.4357 11.6695 23.894 11.497 23.2517 11.3426L21.3347 10.8606C19.8504 10.4996 18.6786 9.93515 17.8192 9.1671C16.959 8.39906 16.5323 7.3639 16.5376 6.06314C16.5323 4.9962 16.816 4.06469 17.3887 3.26788C17.9682 2.47108 18.7618 1.84908 19.7702 1.40187C20.7787 0.955417 21.9255 0.731445 23.2094 0.731445C24.5159 0.731445 25.6559 0.955417 26.6303 1.40187C27.6108 1.84908 28.3726 2.47108 28.9173 3.26788C29.462 4.06469 29.7426 4.98785 29.76 6.03663H26.1923Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a30': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[423.65px] top-[423.75px] absolute" />
                <div data-svg-wrapper className="left-[440.87px] top-[471.97px] absolute">
                    <svg width="34" height="19" viewBox="0 0 34 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.85673 18.5825H0.867615L6.94546 0.971924H11.7425L17.812 18.5825H13.8229L9.41323 4.99603H9.27553L4.85673 18.5825ZM4.60785 11.6603H14.0295V14.5667H4.60785V11.6603ZM19.9311 18.5825V0.971924H26.8774C28.2073 0.971924 29.3421 1.21028 30.2817 1.68548C31.2274 2.15615 31.9468 2.82356 32.4393 3.68922C32.9378 4.54959 33.1874 5.56131 33.1874 6.72511C33.1874 7.8942 32.9355 8.90059 32.4309 9.74279C31.9263 10.5797 31.1956 11.2222 30.2386 11.6694C29.2876 12.1166 28.1355 12.3398 26.7828 12.3398H22.1318V9.34703H26.1814C26.8917 9.34703 27.4818 9.25019 27.9516 9.05496C28.4222 8.86049 28.7717 8.56765 29.0009 8.17795C29.2354 7.78825 29.3534 7.30398 29.3534 6.72511C29.3534 6.14018 29.2354 5.6468 29.0009 5.24575C28.7717 4.8447 28.4192 4.5405 27.9433 4.33392C27.4735 4.12205 26.8804 4.01612 26.164 4.01612H23.6538V18.5825H19.9311ZM29.4389 10.5684L33.8146 18.5825H29.706L25.4249 10.5684H29.4389Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a31': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[508.38px] top-[423.75px] absolute" />
                <div data-svg-wrapper className="left-[525.88px] top-[471.97px] absolute">
                    <svg width="33" height="19" viewBox="0 0 33 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.880981 4.04185V0.971924H15.341V4.04185H9.95085V18.5825H6.27115V4.04185H0.880981ZM32.4489 0.971924V18.5825H29.2337L21.574 7.49843H21.4446V18.5825H17.7225V0.971924H20.9892L28.5884 12.0477H28.7435V0.971924H32.4489Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a32': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[593.11px] top-[423.75px] absolute" />
                <div data-svg-wrapper className="left-[611.28px] top-[471.73px] absolute">
                    <svg width="34" height="19" viewBox="0 0 34 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.0081 0.97207V18.5827H11.7929L4.13316 7.49858H4.00378V18.5827H0.281738V0.97207H3.54837L11.1475 12.0479H11.3026V0.97207H15.0081ZM33.6176 7.13764H29.8524C29.7836 6.65033 29.6429 6.21749 29.431 5.83915C29.2192 5.4555 28.9468 5.12862 28.614 4.85924C28.2819 4.58985 27.8976 4.38325 27.4626 4.23948C27.0329 4.09646 26.5653 4.02458 26.0607 4.02458C25.1499 4.02458 24.3563 4.2516 23.68 4.7041C23.0037 5.15131 22.4794 5.8051 22.1064 6.6647C21.7342 7.51901 21.5481 8.55646 21.5481 9.77776C21.5481 11.0331 21.7342 12.0879 22.1064 12.9415C22.4847 13.7958 23.012 14.4413 23.6883 14.8764C24.3646 15.3122 25.1469 15.5302 26.035 15.5302C26.5336 15.5302 26.9951 15.4643 27.4195 15.3327C27.8492 15.2003 28.2304 15.0088 28.5625 14.7561C28.8954 14.498 29.17 14.1855 29.3879 13.8193C29.6118 13.4523 29.7662 13.0338 29.8524 12.5631L33.6176 12.5806C33.52 13.3887 33.2764 14.1689 32.8868 14.9195C32.5032 15.6648 31.9843 16.333 31.3306 16.9232C30.6831 17.5082 29.9099 17.972 29.0096 18.3163C28.1154 18.6546 27.104 18.8233 25.9753 18.8233C24.4048 18.8233 23.0007 18.4677 21.763 17.7571C20.5306 17.0466 19.5562 16.0175 18.8398 14.6706C18.1295 13.3229 17.7739 11.6922 17.7739 9.77776C17.7739 7.85727 18.1348 6.22354 18.8572 4.87586C19.5789 3.52894 20.5594 2.50287 21.797 1.79763C23.0347 1.08709 24.4274 0.731445 25.9753 0.731445C26.9951 0.731445 27.9407 0.874456 28.8122 1.16124C29.689 1.44803 30.4652 1.86648 31.1415 2.4166C31.8178 2.96142 32.3686 3.62959 32.7922 4.42034C33.2219 5.21184 33.4973 6.11761 33.6176 7.13764Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a33': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[677.84px] top-[423.75px] absolute" />
                <div data-svg-wrapper className="left-[695.44px] top-[471.73px] absolute">
                    <svg width="33" height="19" viewBox="0 0 33 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.5625 6.03663C10.4936 5.3435 10.1986 4.80474 9.67659 4.42034C9.15535 4.0367 8.44725 3.8445 7.55305 3.8445C6.94556 3.8445 6.43265 3.93001 6.0143 4.10254C5.59594 4.26826 5.2752 4.50055 5.05203 4.79869C4.83415 5.09683 4.72521 5.43507 4.72521 5.81342C4.71386 6.12896 4.77967 6.40365 4.92265 6.63898C5.07168 6.87431 5.27519 7.07711 5.53316 7.24964C5.79113 7.41536 6.08921 7.56214 6.42737 7.68775C6.76553 7.80806 7.12639 7.91173 7.5107 7.99724L9.09258 8.37558C9.86044 8.54811 10.5655 8.77739 11.207 9.06342C11.8486 9.35021 12.4046 9.70284 12.8752 10.1213C13.345 10.5397 13.7088 11.0331 13.9668 11.6006C14.2301 12.1682 14.3647 12.8189 14.3708 13.5521C14.3647 14.6304 14.0901 15.5642 13.5454 16.3557C13.0068 17.1412 12.2268 17.7518 11.207 18.1869C10.1925 18.6167 8.96926 18.8324 7.53642 18.8324C6.11493 18.8324 4.87727 18.6145 3.82269 18.1786C2.7734 17.7427 1.9541 17.098 1.36402 16.2437C0.779231 15.3841 0.472839 14.3202 0.444092 13.0535H4.04585C4.08595 13.6437 4.25542 14.1371 4.55349 14.5328C4.85685 14.9225 5.26082 15.2176 5.76542 15.4182C6.27531 15.6134 6.85101 15.711 7.4933 15.711C8.12347 15.711 8.67118 15.6187 9.13492 15.4356C9.60547 15.2517 9.96938 14.9967 10.2274 14.6706C10.4846 14.3437 10.6139 13.9683 10.6139 13.5438C10.6139 13.1481 10.4967 12.8159 10.2614 12.5465C10.0322 12.2771 9.69399 12.0479 9.24689 11.8587C8.80584 11.6695 8.26417 11.497 7.62189 11.3426L5.70488 10.8606C4.2206 10.4996 3.04878 9.93515 2.18938 9.1671C1.32922 8.39906 0.902522 7.3639 0.907818 6.06314C0.902522 4.9962 1.18622 4.06469 1.7589 3.26788C2.33839 2.47108 3.13198 1.84908 4.14041 1.40187C5.14885 0.955417 6.29574 0.731445 7.57955 0.731445C8.88605 0.731445 10.0261 0.955417 11.0005 1.40187C11.9809 1.84908 12.7428 2.47108 13.2874 3.26788C13.8321 4.06469 14.1128 4.98785 14.1302 6.03663H10.5625ZM32.4091 7.13764H28.6432C28.5743 6.65033 28.4344 6.21749 28.2218 5.83915C28.01 5.4555 27.7376 5.12862 27.4055 4.85924C27.0734 4.58985 26.6891 4.38325 26.2533 4.23948C25.8236 4.09646 25.3569 4.02458 24.8523 4.02458C23.9407 4.02458 23.1471 4.2516 22.4708 4.7041C21.7944 5.15131 21.2702 5.8051 20.898 6.6647C20.525 7.51901 20.3389 8.55646 20.3389 9.77776C20.3389 11.0331 20.525 12.0879 20.898 12.9415C21.2762 13.7958 21.8035 14.4413 22.4799 14.8764C23.1562 15.3122 23.9384 15.5302 24.8266 15.5302C25.3251 15.5302 25.7866 15.4643 26.2102 15.3327C26.6407 15.2003 27.0212 15.0088 27.3541 14.7561C27.6862 14.498 27.9616 14.1855 28.1794 13.8193C28.4026 13.4523 28.5577 13.0338 28.6432 12.5631L32.4091 12.5806C32.3115 13.3887 32.0679 14.1689 31.6783 14.9195C31.294 15.6648 30.775 16.333 30.1222 16.9232C29.4746 17.5082 28.7007 17.972 27.8012 18.3163C26.907 18.6546 25.8955 18.8233 24.766 18.8233C23.1963 18.8233 21.7914 18.4677 20.5538 17.7571C19.3214 17.0466 18.347 16.0175 17.6306 14.6706C16.9203 13.3229 16.5646 11.6922 16.5646 9.77776C16.5646 7.85727 16.9263 6.22354 17.648 4.87586C18.3705 3.52894 19.3502 2.50287 20.5886 1.79763C21.8262 1.08709 23.219 0.731445 24.766 0.731445C25.7866 0.731445 26.7322 0.874456 27.603 1.16124C28.4798 1.44803 29.2567 1.86648 29.933 2.4166C30.6094 2.96142 31.1594 3.62959 31.5838 4.42034C32.0135 5.21184 32.2881 6.11761 32.4091 7.13764Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a34': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[762.57px] top-[423.75px] absolute" />
                <div data-svg-wrapper className="left-[780.74px] top-[471.73px] absolute">
                    <svg width="34" height="19" viewBox="0 0 34 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.9802 18.5827H0.738953V0.97207H7.03312C8.80336 0.97207 10.3316 1.3247 11.6101 2.02994C12.8886 2.72913 13.8721 3.73554 14.5529 5.04841C15.2489 6.36052 15.5969 7.93142 15.5969 9.76035C15.5969 11.5946 15.2489 13.1708 14.5529 14.4897C13.8721 15.8079 12.881 16.8196 11.5874 17.5248C10.3088 18.23 8.77314 18.5827 6.9802 18.5827ZM4.46095 15.3924H6.82885C7.92579 15.3924 8.85634 15.198 9.60529 14.8075C10.3618 14.4125 10.9292 13.8019 11.3074 12.9763C11.6933 12.1447 11.8824 11.0732 11.8824 9.76035C11.8824 8.45883 11.6933 7.39567 11.3074 6.57012C10.9292 5.74456 10.3618 5.13694 9.61286 4.74724C8.86391 4.35754 7.93336 4.1623 6.83642 4.1623H4.46095V15.3924ZM33.8894 7.13764H30.122C30.0539 6.65033 29.9102 6.21749 29.6984 5.83915C29.4866 5.4555 29.2141 5.12862 28.8813 4.85924C28.556 4.58985 28.1701 4.38325 27.7314 4.23948C27.3002 4.09646 26.8387 4.02458 26.3318 4.02458C25.4164 4.02458 24.6297 4.2516 23.9488 4.7041C23.2755 5.15131 22.746 5.8051 22.3753 6.6647C22.0046 7.51901 21.8155 8.55646 21.8155 9.77776C21.8155 11.0331 22.0046 12.0879 22.3753 12.9415C22.7535 13.7958 23.2831 14.4413 23.9564 14.8764C24.6372 15.3122 25.4164 15.5302 26.3091 15.5302C26.8008 15.5302 27.2624 15.4643 27.686 15.3327C28.1172 15.2003 28.5031 15.0088 28.8359 14.7561C29.1688 14.498 29.4411 14.1855 29.6605 13.8193C29.8799 13.4523 30.0388 13.0338 30.122 12.5631L33.8894 12.5806C33.7911 13.3887 33.549 14.1689 33.1556 14.9195C32.7698 15.6648 32.2553 16.333 31.6047 16.9232C30.9541 17.5082 30.1825 17.972 29.2823 18.3163C28.3896 18.6546 27.3758 18.8233 26.2486 18.8233C24.6751 18.8233 23.268 18.4677 22.0349 17.7571C20.8018 17.0466 19.8259 16.0175 19.1072 14.6706C18.396 13.3229 18.0405 11.6922 18.0405 9.77776C18.0405 7.85727 18.4035 6.22354 19.1298 4.87586C19.8485 3.52894 20.832 2.50287 22.0651 1.79763C23.3058 1.08709 24.6978 0.731445 26.2486 0.731445C27.2624 0.731445 28.208 0.874456 29.0856 1.16124C29.9555 1.44803 30.7347 1.86648 31.4156 2.4166C32.0889 2.96142 32.6412 3.62959 33.0648 4.42034C33.496 5.21184 33.7684 6.11761 33.8894 7.13764Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a35': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[339.16px] top-[508.50px] absolute" />
                <div data-svg-wrapper className="left-[356.03px] top-[556.48px] absolute">
                    <svg width="35" height="19" viewBox="0 0 35 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.515 9.52776C16.515 11.4483 16.1511 13.082 15.4233 14.4289C14.7009 15.7758 13.7151 16.8049 12.4661 17.5154C11.2224 18.2207 9.82359 18.5733 8.27046 18.5733C6.70599 18.5733 5.3019 18.2177 4.05819 17.5071C2.81448 16.7966 1.83178 15.7675 1.10931 14.4206C0.387591 13.0729 0.0267334 11.4422 0.0267334 9.52776C0.0267334 7.60727 0.387591 5.97354 1.10931 4.62586C1.83178 3.27894 2.81448 2.25287 4.05819 1.54763C5.3019 0.83709 6.70599 0.481445 8.27046 0.481445C9.82359 0.481445 11.2224 0.83709 12.4661 1.54763C13.7151 2.25287 14.7009 3.27894 15.4233 4.62586C16.1511 5.97354 16.515 7.60727 16.515 9.52776ZM12.7407 9.52776C12.7407 8.28375 12.5546 7.23422 12.1824 6.38067C11.8155 5.52636 11.2965 4.8786 10.6263 4.43669C9.95599 3.99554 9.17071 3.77458 8.27046 3.77458C7.37096 3.77458 6.58572 3.99554 5.91545 4.43669C5.24442 4.8786 4.72316 5.52636 4.35095 6.38067C3.98404 7.23422 3.80021 8.28375 3.80021 9.52776C3.80021 10.7718 3.98404 11.8206 4.35095 12.6749C4.72316 13.5292 5.24442 14.1769 5.91545 14.6181C6.58572 15.0592 7.37096 15.2802 8.27046 15.2802C9.17071 15.2802 9.95599 15.0592 10.6263 14.6181C11.2965 14.1769 11.8155 13.5292 12.1824 12.6749C12.5546 11.8206 12.7407 10.7718 12.7407 9.52776ZM19.2725 18.3327V0.72207H22.9945V8.48731H23.2268L29.5626 0.72207H34.0245L27.4913 8.60762L34.1017 18.3327H29.6488L24.826 11.0926L22.9945 13.3279V18.3327H19.2725Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a36': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[423.89px] top-[508.50px] absolute" />
                <div data-svg-wrapper className="left-[441.07px] top-[556.72px] absolute">
                    <svg width="31" height="19" viewBox="0 0 31 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.0657959 18.3325V0.721924H3.78784V15.2626H11.3356V18.3325H0.0657959ZM17.2848 18.3325H13.2957L19.3736 0.721924H24.1706L30.2402 18.3325H26.251L21.8413 4.74603H21.7036L17.2848 18.3325ZM17.036 11.4103H26.4576V14.3167H17.036V11.4103Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a37': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[508.62px] top-[508.50px] absolute" />
                <div data-svg-wrapper className="left-[525.80px] top-[556.48px] absolute">
                    <svg width="37" height="19" viewBox="0 0 37 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.795532 0.72207H5.38606L10.2346 12.5545H10.4411L15.2896 0.72207H19.8801V18.3327H16.2693V6.87023H16.1233L11.5668 18.2464H9.1081L4.55239 6.82709H4.4056V18.3327H0.795532V0.72207ZM32.4981 5.78663C32.4292 5.0935 32.1342 4.55474 31.6129 4.17034C31.0909 3.7867 30.3836 3.5945 29.4894 3.5945C28.8819 3.5945 28.369 3.68001 27.9507 3.85254C27.5323 4.01826 27.2108 4.25055 26.9876 4.54869C26.7697 4.84683 26.6608 5.18507 26.6608 5.56342C26.6494 5.87896 26.7153 6.15365 26.8582 6.38898C27.0073 6.62431 27.2108 6.82711 27.4687 6.99964C27.7267 7.16536 28.0248 7.31214 28.363 7.43775C28.7011 7.55806 29.062 7.66173 29.4463 7.74724L31.0282 8.12558C31.796 8.29811 32.5011 8.52739 33.1426 8.81342C33.7849 9.10021 34.3409 9.45284 34.8107 9.87129C35.2805 10.2897 35.6444 10.7831 35.9024 11.3506C36.1657 11.9182 36.3003 12.5689 36.3064 13.3021C36.3003 14.3804 36.0257 15.3142 35.481 16.1057C34.9424 16.8912 34.1632 17.5018 33.1426 17.9369C32.1281 18.3667 30.9048 18.5824 29.472 18.5824C28.0505 18.5824 26.8129 18.3645 25.7583 17.9286C24.7097 17.4927 23.8897 16.848 23.2996 15.9937C22.7148 15.1341 22.4084 14.0702 22.3797 12.8035H25.9814C26.0215 13.3937 26.191 13.8871 26.4891 14.2828C26.7924 14.6725 27.1964 14.9676 27.701 15.1682C28.2109 15.3634 28.7874 15.461 29.4289 15.461C30.0591 15.461 30.6068 15.3687 31.0713 15.1856C31.5411 15.0017 31.905 14.7467 32.1629 14.4206C32.4209 14.0937 32.5495 13.7183 32.5495 13.2938C32.5495 12.8981 32.4322 12.5659 32.197 12.2965C31.9677 12.0271 31.6296 11.7979 31.1825 11.6087C30.7414 11.4195 30.1998 11.247 29.5583 11.0926L27.6412 10.6106C26.1562 10.2496 24.9844 9.68515 24.125 8.9171C23.2648 8.14906 22.8381 7.1139 22.8442 5.81314C22.8381 4.7462 23.1218 3.81469 23.6953 3.01788C24.274 2.22108 25.0676 1.59908 26.076 1.15187C27.0852 0.705417 28.2313 0.481445 29.5151 0.481445C30.8216 0.481445 31.9624 0.705417 32.9368 1.15187C33.9165 1.59908 34.6791 2.22108 35.223 3.01788C35.7677 3.81469 36.0484 4.73785 36.0658 5.78663H32.4981Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a38': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[593.35px] top-[508.50px] absolute" />
                <div data-svg-wrapper className="left-[609.57px] top-[556.72px] absolute">
                    <svg width="31" height="19" viewBox="0 0 31 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.55961 18.3325H0.570496L6.64834 0.721924H11.4454L17.5149 18.3325H13.5258L9.11611 4.74603H8.97842L4.55961 18.3325ZM4.31073 11.4103H13.7324V14.3167H4.31073V11.4103ZM19.634 18.3325V0.721924H23.3567V15.2626H30.9045V18.3325H19.634Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a39': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[678.08px] top-[508.50px] absolute" />
                <div data-svg-wrapper className="left-[694.95px] top-[556.48px] absolute">
                    <svg width="36" height="19" viewBox="0 0 36 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.9296 6.4147C12.8085 5.99625 12.6398 5.62622 12.4219 5.30539C12.2041 4.97849 11.9378 4.70381 11.6223 4.47983C11.3129 4.25055 10.9573 4.07576 10.5564 3.95544C10.1607 3.83513 9.72271 3.77458 9.24157 3.77458C8.34131 3.77458 7.55074 3.99858 6.86836 4.44579C6.19203 4.893 5.66474 5.54298 5.28648 6.39729C4.90823 7.24555 4.7191 8.28375 4.7191 9.51035C4.7191 10.737 4.90521 11.7804 5.27817 12.64C5.65038 13.5004 6.17767 14.1565 6.86005 14.6097C7.54167 15.0562 8.34735 15.2802 9.2756 15.2802C10.1184 15.2802 10.837 15.1311 11.4332 14.833C12.0354 14.5288 12.4938 14.102 12.8085 13.5519C13.13 13.0018 13.2904 12.351 13.2904 11.5996L14.0469 11.7116H9.50785V8.90801H16.8748V11.1266C16.8748 12.6748 16.5487 14.0044 15.8951 15.1167C15.2415 16.223 14.342 17.0773 13.1959 17.6789C12.0497 18.2752 10.7372 18.5733 9.25819 18.5733C7.60747 18.5733 6.15799 18.2093 4.90823 17.4814C3.65922 16.7474 2.68485 15.7069 1.98583 14.36C1.2921 13.007 0.945618 11.4021 0.945618 9.54439C0.945618 8.11726 1.15138 6.84451 1.56444 5.72687C1.98279 4.60318 2.56758 3.65124 3.31804 2.87185C4.0685 2.09245 4.94304 1.49921 5.94012 1.0921C6.93721 0.685002 8.01751 0.481445 9.18103 0.481445C10.1781 0.481445 11.1064 0.627501 11.9665 0.920342C12.8259 1.20637 13.5885 1.61346 14.2535 2.14088C14.9238 2.66829 15.4707 3.29636 15.8951 4.0243C16.3195 4.74619 16.5911 5.54299 16.7122 6.4147H12.9296ZM22.1621 18.3327H18.173L24.2508 0.72207H29.0479L35.1174 18.3327H31.1283L26.7186 4.74618H26.5809L22.1621 18.3327ZM21.9132 11.4104H31.3348V14.3169H21.9132V11.4104Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a40': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[761.81px] top-[169.50px] absolute" />
                <div data-svg-wrapper className="left-[779.98px] top-[217.72px] absolute">
                    <svg width="35" height="19" viewBox="0 0 35 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.7118 0.721924V18.3325H12.4966L4.83306 7.24843H4.70442V18.3325H0.982422V0.721924H4.25053L11.8535 11.7977H12.0048V0.721924H15.7118ZM17.7543 0.721924H21.9227L25.9399 8.3063H26.1138L30.1234 0.721924H34.2918L27.8765 12.1072V18.3325H24.1772V12.1072L17.7543 0.721924Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a41': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[846.54px] top-[169.50px] absolute" />
                <div data-svg-wrapper className="left-[864.71px] top-[217.72px] absolute">
                    <svg width="39" height="19" viewBox="0 0 39 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.712097 0.721924H5.3041L10.1534 12.5544H10.3577L15.207 0.721924H19.799V18.3325H16.1904V6.87008H16.0391L11.4849 18.2463H9.02619L4.47196 6.82697H4.32826V18.3325H0.712097V0.721924ZM25.904 18.3325H21.9097L27.992 0.721924H32.7884L38.8555 18.3325H34.8688L30.4582 4.74605H30.3221L25.904 18.3325ZM25.6544 11.4103H35.073V14.3167H25.6544V11.4103Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a42': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[931.27px] top-[169.50px] absolute" />
                <div data-svg-wrapper className="left-[949.44px] top-[217.72px] absolute">
                    <svg width="21" height="19" viewBox="0 0 21 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.441772 18.3325V0.721924H7.38653C8.718 0.721924 9.85277 0.960301 10.7908 1.43551C11.7365 1.90617 12.4628 2.57356 12.9546 3.43922C13.4539 4.29959 13.7035 5.31129 13.7035 6.47508C13.7035 7.64418 13.4463 8.65059 12.947 9.49279C12.4401 10.3297 11.7063 10.9722 10.7531 11.4194C9.79987 11.8666 8.64991 12.0898 7.29575 12.0898H2.64326V9.09706H6.6906C7.40172 9.09706 7.99178 9.00019 8.46082 8.80496C8.93742 8.61049 9.28543 8.31765 9.51238 7.92795C9.7469 7.53825 9.86792 7.05396 9.86792 6.47508C9.86792 5.89016 9.7469 5.3968 9.51238 4.99575C9.28543 4.5947 8.92985 4.29052 8.45324 4.08394C7.9842 3.87207 7.39414 3.76612 6.67545 3.76612H4.16377V18.3325H0.441772ZM9.95113 10.3184L14.3314 18.3325H10.2159L5.93408 10.3184H9.95113ZM20.0506 0.721924V18.3325H16.3286V0.721924H20.0506Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a43': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[846.54px] top-[84.75px] absolute" />
                <div data-svg-wrapper className="left-[863.76px] top-[132.97px] absolute">
                    <svg width="34" height="19" viewBox="0 0 34 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.89703 0.971924L9.14864 14.3518H9.31505L13.5742 0.971924H17.7049L11.6376 18.5825H6.84132L0.758911 0.971924H4.89703ZM19.1497 4.04183V0.971924H33.6143V4.04183H28.2204V18.5825H24.5437V4.04183H19.1497Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a44': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[931.27px] top-[84.75px] absolute" />
                <div data-svg-wrapper className="left-[949.44px] top-[132.97px] absolute">
                    <svg width="34" height="19" viewBox="0 0 34 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.1711 0.971924V18.5825H11.9559L4.29241 7.49843H4.16377V18.5825H0.441772V0.971924H3.70988L11.3129 12.0477H11.4642V0.971924H15.1711ZM18.2426 18.5825V0.971924H21.9646V8.23848H29.5222V0.971924H33.2367V18.5825H29.5222V11.3076H21.9646V18.5825H18.2426Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a45': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[931.27px] top-0 absolute" />
                <div data-svg-wrapper className="left-[949.44px] top-[48.22px] absolute">
                    <svg width="35" height="18" viewBox="0 0 35 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.441772 0.222168H5.03378L9.88307 12.0541H10.0873L14.9366 0.222168H19.5286V17.8325H15.92V6.37033H15.7688L11.2145 17.7466H8.75587L4.20163 6.32735H4.05794V17.8325H0.441772V0.222168ZM22.5926 17.8325V0.222168H34.4622V3.29194H26.3146V7.48812H33.8495V10.558H26.3146V14.7628H34.4925V17.8325H22.5926Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a46': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[508.38px] top-[84.75px] absolute" />
                <div data-svg-wrapper className="left-[525.48px] top-[132.97px] absolute">
                    <svg width="31" height="19" viewBox="0 0 31 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.51468 18.5825L0.477051 0.971924H4.54332L7.45819 13.2085H7.6042L10.8194 0.971924H14.3009L17.5077 13.2342H17.6621L20.5761 0.971924H24.6424L19.6048 18.5825H15.9773L12.6244 7.06862H12.4867L9.14295 18.5825H5.51468ZM30.3571 0.971924V18.5825H26.6351V0.971924H30.3571Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a47': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-0 top-[84.75px] absolute" />
                <div data-svg-wrapper className="left-[17.22px] top-[132.97px] absolute">
                    <svg width="35" height="19" viewBox="0 0 35 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.20824 18.5825H0.21936L6.29728 0.971924H11.0943L17.1636 18.5825H13.1747L8.7645 4.99603H8.62697L4.20824 18.5825ZM3.95889 11.6603H13.381V14.5667H3.95889V11.6603ZM19.2826 18.5825V0.971924H23.0051V8.73714H23.2372L29.573 0.971924H34.0347L27.5012 8.85745L34.1121 18.5825H29.6589L24.8361 11.3424L23.0051 13.5777V18.5825H19.2826Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a48': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-0 top-[508.50px] absolute" />
                <div data-svg-wrapper className="left-[18.17px] top-[556.72px] absolute">
                    <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.173584 18.3325V0.721924H3.89602V7.9885H11.4525V0.721924H15.1664V18.3325H11.4525V11.0576H3.89602V18.3325H0.173584ZM21.9578 0.721924V18.3325H18.2354V0.721924H21.9578Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a49': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[338.92px] top-[593.25px] absolute" />
                <div data-svg-wrapper className="left-[356.42px] top-[641.47px] absolute">
                    <svg width="33" height="19" viewBox="0 0 33 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.421509 3.54209V0.472168H14.8816V3.54209H9.49138V18.0828H5.81168V3.54209H0.421509ZM20.7529 0.472168L24.3039 6.47429H24.4409L28.0086 0.472168H32.2126L26.8398 9.27786L32.3328 18.0828H28.0517L24.4409 12.0723H24.3039L20.6931 18.0828H16.4286L21.9398 9.27786L16.5323 0.472168H20.7529Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
    'a50': {
        renderSvg: (state: State, onClick: (reference: string) => void) => (
            <div onClick={() => onClick(state.reference)}>
                <div className="w-20 h-20 left-[762.57px] top-[593.25px] absolute" />
                <div data-svg-wrapper className="left-[780.74px] top-[641.47px] absolute">
                    <svg width="27" height="19" viewBox="0 0 27 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.738953 18.0828V0.472168H12.3969V3.54209H4.46095V7.73874H11.6252V10.8079H4.46095V18.0828H0.738953ZM14.9009 18.0828V0.472168H18.623V15.0128H26.173V18.0828H14.9009Z" fill="#122823" />
                    </svg>
                </div>
            </div>
        )
    },
};

