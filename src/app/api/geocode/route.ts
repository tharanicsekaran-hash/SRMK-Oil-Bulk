import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pincode = searchParams.get("pincode");

  if (!pincode || pincode.length !== 6) {
    return NextResponse.json(
      { error: "Invalid pincode" },
      { status: 400 }
    );
  }

  try {
    // Try India Post API first (free, no authentication)
    const indiaPostResponse = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`
    );
    const indiaPostData = await indiaPostResponse.json();

    if (
      indiaPostData &&
      indiaPostData[0]?.Status === "Success" &&
      indiaPostData[0]?.PostOffice &&
      indiaPostData[0]?.PostOffice.length > 0
    ) {
      const postOffice = indiaPostData[0].PostOffice[0];
      
      // Prioritize Block (locality) > District
      let city = postOffice.Block && postOffice.Block !== "NA" 
        ? postOffice.Block 
        : postOffice.District;
      
      // Clean up common suffixes from Region field if we end up using it
      if (!city || city === "NA") {
        city = postOffice.Region || postOffice.District;
      }
      
      if (city) {
        // Clean up suffixes like "Region", "HQ", etc.
        city = city
          .replace(/\s+Region$/i, "")
          .replace(/\s+HQ$/i, "")
          .trim();
        
        console.log(`India Post API - Found city: ${city} for pincode: ${pincode}`);
        return NextResponse.json({
          success: true,
          city: city,
        });
      }
    }

    // Fallback to Google Maps API if available and India Post fails
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode},India&key=${apiKey}`
      );

      const data = await response.json();

      if (data.status === "OK" && data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        
        // Search in priority order: locality > postal_town > sublocality > administrative_area_level_3 > district
        let cityComponent = addressComponents.find(
          (component: { types: string[]; long_name: string }) =>
            component.types.includes("locality")
        );

        if (!cityComponent) {
          cityComponent = addressComponents.find(
            (component: { types: string[]; long_name: string }) =>
              component.types.includes("postal_town")
          );
        }

        if (!cityComponent) {
          cityComponent = addressComponents.find(
            (component: { types: string[]; long_name: string }) =>
              component.types.includes("sublocality") ||
              component.types.includes("sublocality_level_1")
          );
        }

        if (!cityComponent) {
          cityComponent = addressComponents.find(
            (component: { types: string[]; long_name: string }) =>
              component.types.includes("administrative_area_level_3")
          );
        }

        // Only use district as last resort
        if (!cityComponent) {
          cityComponent = addressComponents.find(
            (component: { types: string[]; long_name: string }) =>
              component.types.includes("administrative_area_level_2")
          );
        }

        if (cityComponent) {
          console.log(`Google Maps API - Found city: ${cityComponent.long_name} for pincode: ${pincode}`);
          return NextResponse.json({
            success: true,
            city: cityComponent.long_name,
          });
        }
      }
    }

    return NextResponse.json(
      { error: "City not found for this pincode" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Failed to fetch city" },
      { status: 500 }
    );
  }
}

