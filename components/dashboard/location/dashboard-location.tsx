"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { Loader2, MapPin, Store, Car, Map as MapIcon } from "lucide-react";
import type { Country } from "react-phone-number-input";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { ServiceLocationResponse, LocationType } from "@/lib/api/types";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { ApiError } from "@/lib/api/auth-client";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SearchableCountrySelect } from "@/components/ui/searchable-country-select";
import { AddressInput } from "@/components/ui/address-input";
import { ComboboxInput } from "@/components/ui/combobox-input";

function MapPanController({ center }: { center: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && center && center.lat !== 0 && center.lng !== 0) {
      map.panTo(center);
      map.setZoom(14);
    }
  }, [map, center]);
  return null;
}

function MapCircle({ center, radiusKm }: { center: { lat: number; lng: number } | null; radiusKm: number }) {
  const map = useMap();
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map || !center) return;
    const c = new window.google.maps.Circle({
      map,
      center,
      radius: radiusKm * 1000,
      fillColor: "#000000",
      fillOpacity: 0.1,
      strokeColor: "#000000",
      strokeOpacity: 0.3,
      strokeWeight: 2,
    });
    setCircle(c);
    return () => {
      c.setMap(null);
    };
  }, [map, center]);

  useEffect(() => {
    if (circle && center) {
      circle.setRadius(radiusKm * 1000);
      circle.setCenter(center);
    }
  }, [circle, radiusKm, center]);

  return null;
}

export function DashboardLocation({
  dict,
  common,
  lang,
  initialData,
}: {
  dict: Dictionary["onboarding"]["serviceLocation"];
  common: Dictionary["common"];
  lang: Locale;
  initialData: ServiceLocationResponse;
}) {
  const { data: session } = useSession();

  const [country, setCountry] = useState<Country | "">((initialData.country as Country) ?? "");
  const [locationType, setLocationType] = useState<LocationType | "">(initialData.location_type ?? "");
  const [salonName, setSalonName] = useState(initialData.salon_name ?? "");
  const [addressLine1, setAddressLine1] = useState(initialData.address_line1 ?? "");
  const [addressLine2, setAddressLine2] = useState(initialData.address_line2 ?? "");
  const [city, setCity] = useState(initialData.city ?? "");
  const [postalCode, setPostalCode] = useState(initialData.postal_code ?? "");
  const [lat, setLat] = useState<number | null>(initialData.latitude ?? null);
  const [lng, setLng] = useState<number | null>(initialData.longitude ?? null);

  const [offersMobile, setOffersMobile] = useState(initialData.offers_mobile ?? false);
  const [travelRadiusKm, setTravelRadiusKm] = useState(initialData.travel_radius_km?.toString() ?? "");
  const [travelFee, setTravelFee] = useState(initialData.travel_fee?.toString() ?? "");

  const saveMutation = useMutation({
    mutationFn: async () => {
      return onboardingApi.updateServiceLocation(
        session!.accessToken,
        {
          location_type: locationType || null,
          salon_name: isFixedLocation && locationType === "SALON" ? (salonName.trim() || null) : null,
          address_line1: isFixedLocation ? (addressLine1.trim() || null) : null,
          address_line2: isFixedLocation ? (addressLine2.trim() || null) : null,
          city: city.trim() || null,
          postal_code: isFixedLocation ? (postalCode.trim() || null) : null,
          country: country || null,
          latitude: lat ?? null,
          longitude: lng ?? null,
          offers_mobile: offersMobile,
          travel_radius_km: offersMobile && travelRadiusKm ? parseInt(travelRadiusKm, 10) : null,
          travel_fee: offersMobile && travelFee ? parseFloat(travelFee) : null,
        },
        lang
      );
    },
    onSuccess: () => {
      toast.success(dict.toasts.saved || "Location settings saved");
    },
    onError: (error) => {
      const code = error instanceof ApiError ? error.code : undefined;
      toast.error(getAuthErrorMessage(code, common.errors));
    },
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    saveMutation.mutate();
  }

  const isFixedLocation = locationType === "HOME_STUDIO" || locationType === "SALON";
  const numLat = Number(lat);
  const numLng = Number(lng);
  const hasCoordinates = lat !== null && lng !== null && !isNaN(numLat) && !isNaN(numLng);
  const currentCenter = hasCoordinates ? { lat: numLat, lng: numLng } : null;

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column: Settings */}
          <div className="flex-1 space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Location Settings</h1>
              <p className="mt-2 text-sm text-muted-foreground">Manage your service location and mobile travel coverage.</p>
            </div>

            {/* Base Setup Card */}
            <div className="rounded-xl border border-border bg-surface shadow-sm">
              <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-3 rounded-t-xl">
                <Store className="size-4 text-brand" />
                <h2 className="text-sm font-semibold text-foreground">Service Type</h2>
              </div>
              <div className="p-5 space-y-5">
                <SearchableCountrySelect
                  label={dict.countryLabel}
                  value={country}
                  onChange={(val) => setCountry(val)}
                />

                <Select
                  label={dict.locationTypeLabel}
                  showLabel
                  value={locationType}
                  onChange={(val) => setLocationType(val as LocationType | "")}
                  options={[
                    { value: "", label: "-- Select --" },
                    { value: "HOME_STUDIO", label: dict.locationTypes.homeStudio },
                    { value: "SALON", label: dict.locationTypes.salon },
                  ]}
                />

                {locationType === "SALON" && (
                  <Input
                    label={dict.salonNameLabel}
                    showLabel
                    value={salonName}
                    onChange={(e) => setSalonName(e.target.value)}
                    placeholder={dict.salonNamePlaceholder}
                  />
                )}
              </div>
            </div>

            {/* Address Details Card */}
            {(isFixedLocation || offersMobile) && country && (
              <div className="rounded-xl border border-border bg-surface shadow-sm">
                <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-3 rounded-t-xl">
                  <MapPin className="size-4 text-brand" />
                  <h2 className="text-sm font-semibold text-foreground">Address Details</h2>
                </div>
                <div className="p-5 space-y-5">
                  <AddressInput
                    label={isFixedLocation ? dict.addressLine1Label : dict.cityLabel}
                    showLabel
                    placeholder={isFixedLocation ? dict.addressLine1Placeholder : dict.cityPlaceholder}
                    countryCode={country}
                    defaultValue={isFixedLocation ? addressLine1 : city}
                    onAddressSelected={(address) => {
                      setAddressLine1(address.line1);
                      setCity(address.city);
                      setPostalCode(address.postalCode);
                      setLat(address.lat);
                      setLng(address.lng);
                    }}
                  />

                  {isFixedLocation && (
                    <Input
                      label={dict.addressLine2Label}
                      showLabel
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder={dict.addressLine2Placeholder}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {isFixedLocation && (
                      <Input
                        label={dict.postalCodeLabel}
                        showLabel
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder={dict.postalCodePlaceholder}
                      />
                    )}
                    {isFixedLocation && (
                      <div className="col-span-2 sm:col-span-1">
                        <Input
                          label={dict.cityLabel}
                          showLabel
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder={dict.cityPlaceholder}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Services Card */}
            <div className="rounded-xl border border-border bg-surface shadow-sm">
              <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-3 rounded-t-xl">
                <Car className="size-4 text-brand" />
                <h2 className="text-sm font-semibold text-foreground">Mobile Services</h2>
              </div>
              <div className="p-5 space-y-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offersMobile}
                    onChange={(e) => setOffersMobile(e.target.checked)}
                    className="size-4 rounded border-input bg-background text-brand accent-brand focus:ring-brand"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {dict.offersMobileLabel}
                  </span>
                </label>

                {offersMobile && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <ComboboxInput
                      label={dict.travelRadiusLabel}
                      showLabel
                      type="number"
                      min="1"
                      max="500"
                      value={travelRadiusKm}
                      onChange={(e) => setTravelRadiusKm(e.target.value)}
                      options={["5", "10", "15", "20", "25", "50", "100"]}
                    />
                    <Input
                      label={dict.travelFeeLabel}
                      showLabel
                      type="number"
                      min="0"
                      step="0.01"
                      value={travelFee}
                      onChange={(e) => setTravelFee(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 pb-6">
              <Button type="submit" disabled={saveMutation.isPending} className="w-full sm:w-auto sm:px-8">
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  dict.saveChanges || "Save Changes"
                )}
              </Button>
            </div>
          </div>

          {/* Right Column: Interactive Map */}
          <div className="w-full lg:w-[45%] xl:w-[40%] flex-shrink-0">
            <div className="sticky top-24 rounded-xl border border-border bg-surface shadow-sm">
              <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-3 rounded-t-xl">
                <MapIcon className="size-4 text-brand" />
                <h2 className="text-sm font-semibold text-foreground">Coverage Map</h2>
              </div>
              
              {hasCoordinates ? (
                <div className="h-[400px] w-full bg-muted rounded-b-xl overflow-hidden">
                  <Map
                    defaultZoom={13}
                    defaultCenter={currentCenter!}
                    gestureHandling="cooperative"
                    disableDefaultUI={true}
                  >
                    <Marker position={currentCenter} />
                    <MapPanController center={currentCenter} />
                    {offersMobile && travelRadiusKm && (
                      <MapCircle center={currentCenter} radiusKm={parseInt(travelRadiusKm, 10)} />
                    )}
                  </Map>
                </div>
              ) : (
                <div className="h-[400px] w-full flex flex-col items-center justify-center p-6 text-center bg-muted/20 border-t border-border rounded-b-xl">
                  <MapPin className="size-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-foreground">No Location Set</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">Enter your address on the left to see your location and coverage area on the map.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </form>
    </APIProvider>
  );
}
