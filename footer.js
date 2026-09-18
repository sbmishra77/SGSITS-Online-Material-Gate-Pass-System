/* =========================================
   OM-GPS COMMON FOOTER
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const footerContainer =
        document.getElementById("omgpsFooterContainer");


    if (!footerContainer) {
        return;
    }


    footerContainer.innerHTML = `

        <footer class="omgps-footer">


            <!-- =========================
                 LEFT SIDE
                 DEVELOPER
            ========================== -->

            <div class="developer-credit">


                <!-- Developer Photo -->

                <img
                    src="assets/sbmishra-profile.jpeg"
                    alt="Dr. SB Mishra"
                    class="developer-photo"
                >


                <!-- Three Lines -->

                <div class="developer-details">


                    <div class="developer-by">
                        Developed By:
                    </div>


                    <div class="developer-name">
                        डॉ. एस. बी. मिश्रा
                    </div>


                    <div class="developer-info">
                        AG-2, SGSITS, Indore 8982086150
                    </div>


                </div>


            </div>



            <!-- =========================
                 RIGHT SIDE
                 RIGHTS RESERVED
            ========================== -->

            <div class="rights-reserved">

                All Rights Reserved जीएस OM-GPS

            </div>


        </footer>

    `;

});