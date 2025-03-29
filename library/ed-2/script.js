document.addEventListener('DOMContentLoaded', function () {
    const chaptersList = document.getElementById('chapters-list');
    const pdfViewerContainer = document.querySelector('.pdf-container');
    const artistContainer = document.getElementById('artistContainer');
    let currentChapterId = null;

    // Function to toggle chapter notes visibility
    function toggleChapterNotes(chapterId) {
        const chapterNotes = document.getElementById(chapterId).querySelector('.chapter-notes');
        chapterNotes.classList.toggle('visible');
    }

    // Function to handle click events on chapter links
    function navigateToPage(event) {
        event.preventDefault();
        const pageNumber = event.target.getAttribute('data-page');
        console.log("Page Number:", pageNumber); // Log the page number for debugging

        const existingViewer = document.getElementById('pdf-viewer');
        if (existingViewer) {
            pdfViewerContainer.removeChild(existingViewer);
        }

        const newViewer = document.createElement('iframe');
        newViewer.id = 'pdf-viewer';
        newViewer.title = 'viewer';
        newViewer.src = `ed-2.pdf#page=${pageNumber}`;
        pdfViewerContainer.appendChild(newViewer);

        // Display artist information for the selected chapter
        const artistName = event.target.getAttribute('data-artist');
        displayArtistInfo(artistName);

        // Toggle chapter notes visibility
        const chapterId = event.target.getAttribute('data-chapter');
        if (currentChapterId !== chapterId) {
            // Close the current chapter notes if a different chapter is clicked
            if (currentChapterId) {
                toggleChapterNotes(currentChapterId);
            }
            currentChapterId = chapterId;
        }
        toggleChapterNotes(chapterId);
    }

    // Add event listeners to chapter links
    chaptersList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', navigateToPage);
    });

    // Function to fetch artist information from Wikipedia API
    async function fetchArtistInfo(artistName) {
        const url = "https://en.wikipedia.org/w/api.php";

        const params = new URLSearchParams({
            action: "query",
            prop: "extracts|pageprops|pageimages", // Include pageimages property
            exintro: true,
            explaintext: true,
            piprop: "thumbnail", // Specify thumbnail property for images
            pithumbsize: 150, // Specify the size of the thumbnail
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
    }

    // Function to truncate text
    function truncateText(text, maxWords) {
        const words = text.split(' ');
        if (words.length > maxWords) {
            return words.slice(0, maxWords).join(' ') + '...'; // Add an ellipse if text is truncated
        } else {
            return text;
        }
    }

    // Function to display artist information
    async function displayArtistInfo(artistName) {
        // Clear previous artist information
        artistContainer.innerHTML = '';

        const artistDiv = document.createElement("div");
        artistDiv.id = 'artist-info';

        // Fetch artist information from Wikipedia API
        const artistInfo = await fetchArtistInfo(artistName);

        if (artistInfo && artistInfo.extract) {
            const truncatedText = truncateText(artistInfo.extract, 60);
            const thumbnailUrl = artistInfo.thumbnail ? artistInfo.thumbnail.source : "";
            const thumbnailSection = thumbnailUrl ? `<div style="float: left; margin-right: 10px;"><img src="${thumbnailUrl}" alt="${artistInfo.title} thumbnail"></div>` : '';
            artistDiv.innerHTML = `
                <h2>${artistInfo.title}</h2>
                ${thumbnailSection}
                <p>${artistInfo.pageprops && artistInfo.pageprops.wikibase_item ? truncatedText : "N/A"}</p>
                <br>
            `;
        } else {
            artistDiv.innerHTML = `
                <h2>${artistName}</h2>
                <p>No information found</p>
            `;
            console.error(`No information found for ${artistName}`);
        }

        // Display artist information
        artistContainer.style.display = 'block';
        artistContainer.appendChild(artistDiv);
    }
});
