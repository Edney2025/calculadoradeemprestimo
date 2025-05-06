document.addEventListener('DOMContentLoaded', function() {
    //console.log('DOM Ready, initializing navigation highlight.');
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar nav a');

    // Function to normalize paths (remove trailing slashes and index.html)
    const normalizePath = (path) => {
        if (path.endsWith('/')) {
            path = path.slice(0, -1); // Remove trailing slash
        }
        if (path.endsWith('/index.html')) {
            path = path.slice(0, -'/index.html'.length); // Remove index.html
        }
        // Handle root case for index.html comparison
         if (path === '/index.html') {
            path = '';
         }
         //Ensure it starts with / if not empty
         if(path !== '' && !path.startsWith('/')) {
            path = '/' + path;
         }
        return path;
    };

    const normalizedCurrentPath = normalizePath(currentPath);
    //console.log('Normalized Current Path:', normalizedCurrentPath);

    let bestMatchLink = null;
    let longestMatchLength = -1;

    navLinks.forEach(link => {
        if (!link.href || link.getAttribute('href') === '#') {
             //console.warn('Skipping link without valid href:', link);
            return; // Skip links without href or just '#'
        }

        const linkUrl = new URL(link.href, window.location.origin); // Ensure base URL is correct
        let normalizedLinkPath = normalizePath(linkUrl.pathname);
       //console.log(Comparing: '' with '' (from ));


        // Check if current path *is exactly* or *starts with* the link's path
        if (normalizedCurrentPath === normalizedLinkPath || (normalizedLinkPath !== '' && normalizedCurrentPath.startsWith(normalizedLinkPath + '/'))) {
             const matchLength = normalizedLinkPath.length;
              //console.log(Potential match found:  with length )

             // We want the longest matching path prefix to be active
             if (matchLength > longestMatchLength) {
                 longestMatchLength = matchLength;
                 bestMatchLink = link;
                 //console.log(New best match: );
             }
        }

        // Reset class first
        link.classList.remove('active');
    });

    // Activate the best match found
    if (bestMatchLink) {
        //console.log('Activating best match link:', bestMatchLink.href);
        bestMatchLink.classList.add('active');
    } else if (normalizedCurrentPath === '' || normalizedCurrentPath === '/') {
         // Special case: if no other match and we are on the root, try to activate the link explicitly pointing to index.html or dashboard
         const rootLink = document.querySelector('.sidebar nav a[href$="index.html"], .sidebar nav a[href$="dashboard-app.html"]'); // Look for explicit root links
        if(rootLink) {
            //console.log('Activating root link:', rootLink.href);
             rootLink.classList.add('active');
         }
    }
});
