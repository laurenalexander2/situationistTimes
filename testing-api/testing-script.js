document.addEventListener("DOMContentLoaded", function() {
    const fetchArtistInfo = async (artistName) => {
        const url = "https://en.wikipedia.org/w/api.php"; 
    
        const params = new URLSearchParams({
            action: "query",
            prop: "extracts|pageprops|pageimages", // Include pageimages property
            exintro: true,
            explaintext: true,
            piprop: "thumbnail", // Specify thumbnail property for images
            pithumbsize: 200, // Specify the size of the thumbnail (you can adjust this size as needed)
            titles: artistName,
            format: "json",
            origin: "*"
        });
    
        try {
            const response = await fetch(`${url}?${params}`);
            const data = await response.json();
            const pageId = Object.keys(data.query.pages)[0];
            return data.query.pages[pageId];
        } catch (error) {
            console.error("Error fetching data:", error);
            return null;
        }
    };
    
    const truncateText = (text, maxWords) => {
        const words = text.split(' ');
        if (words.length > maxWords) {
            return words.slice(0, maxWords).join(' ') + '...'; // Add an ellipse if text is truncated
        } else {
            return text;
        }
    };
    
    const displayArtistInfo = async (artistName, containerId) => {
        const artistContainer = document.getElementById(containerId);
        const artistInfo = await fetchArtistInfo(artistName);
    
        const artistDiv = document.createElement("div"); // Create the artistDiv regardless of whether there's information or not
    
        if (artistInfo && artistInfo.extract) { // Check if artistInfo and artistInfo.extract are defined
            const truncatedText = truncateText(artistInfo.extract, 40); // Truncate text after 30 words
            const thumbnailUrl = artistInfo.thumbnail ? artistInfo.thumbnail.source : ""; // Get thumbnail URL if available
            const thumbnailSection = thumbnailUrl ? `<img src="${thumbnailUrl}" alt="${artistInfo.title} thumbnail">` : ''; // Render thumbnail section only if thumbnail URL is available
            artistDiv.innerHTML = `
                <h2>${artistInfo.title}</h2>
                ${thumbnailSection}
                <p>${artistInfo.pageprops && artistInfo.pageprops.wikibase_item ? truncatedText : "N/A"}</p>
            `;
        } else {
            artistDiv.innerHTML = `
                <h2>${artistName}</h2>
                <p>No information found</p>
            `;
            console.error(`No information found for ${artistName}`);
        }

        artistContainer.appendChild(artistDiv); // Append the artistDiv to the artistContainer
    };

    // Display information for each artist
    displayArtistInfo("Anton Ehrenzweig", "artistContainer");
    displayArtistInfo("Max Bucaille", "artistContainer");
    displayArtistInfo("Pierre Alechinsky", "artistContainer");
    displayArtistInfo("Jacqueline de Jong", "artistContainer");
    displayArtistInfo("Reinhoud", "artistContainer");
});
