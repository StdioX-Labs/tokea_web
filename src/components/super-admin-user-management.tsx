'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Event {
    eventId: number;
    eventName: string;
    posterUrl?: string;
    location?: string;
    eventStartDate?: string;
    isActive: boolean;
}

interface CreateUserResponse {
    message: string;
    user: {
        user_id: number;
        email: string;
        role: string;
        company_name: string;
    };
    status: boolean;
}

const COUNTRIES = [
    { code: "93", name: "Afghanistan", flag: "🇦🇫" },
    { code: "355", name: "Albania", flag: "🇦🇱" },
    { code: "213", name: "Algeria", flag: "🇩🇿" },
    { code: "1684", name: "American Samoa", flag: "🇦🇸" },
    { code: "376", name: "Andorra", flag: "🇦🇩" },
    { code: "244", name: "Angola", flag: "🇦🇴" },
    { code: "1264", name: "Anguilla", flag: "🇦🇮" },
    { code: "672", name: "Antarctica", flag: "🇦🇶" },
    { code: "1268", name: "Antigua & Barbuda", flag: "🇦🇬" },
    { code: "54", name: "Argentina", flag: "🇦🇷" },
    { code: "374", name: "Armenia", flag: "🇦🇲" },
    { code: "297", name: "Aruba", flag: "🇦🇼" },
    { code: "61", name: "Australia", flag: "🇦🇺" },
    { code: "43", name: "Austria", flag: "🇦🇹" },
    { code: "994", name: "Azerbaijan", flag: "🇦🇿" },
    { code: "1242", name: "Bahamas", flag: "🇧🇸" },
    { code: "973", name: "Bahrain", flag: "🇧🇭" },
    { code: "880", name: "Bangladesh", flag: "🇧🇩" },
    { code: "1246", name: "Barbados", flag: "🇧🇧" },
    { code: "375", name: "Belarus", flag: "🇧🇾" },
    { code: "32", name: "Belgium", flag: "🇧🇪" },
    { code: "501", name: "Belize", flag: "🇧🇿" },
    { code: "229", name: "Benin", flag: "🇧🇯" },
    { code: "1441", name: "Bermuda", flag: "🇧🇲" },
    { code: "975", name: "Bhutan", flag: "🇧🇹" },
    { code: "591", name: "Bolivia", flag: "🇧🇴" },
    { code: "387", name: "Bosnia & Herzegovina", flag: "🇧🇦" },
    { code: "267", name: "Botswana", flag: "🇧🇼" },
    { code: "55", name: "Brazil", flag: "🇧🇷" },
    { code: "246", name: "British Indian Ocean Territory", flag: "🇮🇴" },
    { code: "1284", name: "British Virgin Islands", flag: "🇻🇬" },
    { code: "673", name: "Brunei", flag: "🇧🇳" },
    { code: "359", name: "Bulgaria", flag: "🇧🇬" },
    { code: "226", name: "Burkina Faso", flag: "🇧🇫" },
    { code: "257", name: "Burundi", flag: "🇧🇮" },
    { code: "855", name: "Cambodia", flag: "🇰🇭" },
    { code: "237", name: "Cameroon", flag: "🇨🇲" },
    { code: "1", name: "Canada", flag: "🇨🇦" },
    { code: "238", name: "Cape Verde", flag: "🇨🇻" },
    { code: "1345", name: "Cayman Islands", flag: "🇰🇾" },
    { code: "236", name: "Central African Republic", flag: "🇨🇫" },
    { code: "235", name: "Chad", flag: "🇹🇩" },
    { code: "56", name: "Chile", flag: "🇨🇱" },
    { code: "86", name: "China", flag: "🇨🇳" },
    { code: "61", name: "Christmas Island", flag: "🇨🇽" },
    { code: "61", name: "Cocos Islands", flag: "🇨🇨" },
    { code: "57", name: "Colombia", flag: "🇨🇴" },
    { code: "269", name: "Comoros", flag: "🇰🇲" },
    { code: "242", name: "Congo - Brazzaville", flag: "🇨🇬" },
    { code: "243", name: "Congo - Kinshasa", flag: "🇨🇩" },
    { code: "682", name: "Cook Islands", flag: "🇨🇰" },
    { code: "506", name: "Costa Rica", flag: "🇨🇷" },
    { code: "225", name: "Côte d'Ivoire", flag: "🇨🇮" },
    { code: "385", name: "Croatia", flag: "🇭🇷" },
    { code: "53", name: "Cuba", flag: "🇨🇺" },
    { code: "599", name: "Curaçao", flag: "🇨🇼" },
    { code: "357", name: "Cyprus", flag: "🇨🇾" },
    { code: "420", name: "Czechia", flag: "🇨🇿" },
    { code: "45", name: "Denmark", flag: "🇩🇰" },
    { code: "253", name: "Djibouti", flag: "🇩🇯" },
    { code: "1767", name: "Dominica", flag: "🇩🇲" },
    { code: "1809", name: "Dominican Republic", flag: "🇩🇴" },
    { code: "593", name: "Ecuador", flag: "🇪🇨" },
    { code: "20", name: "Egypt", flag: "🇪🇬" },
    { code: "503", name: "El Salvador", flag: "🇸🇻" },
    { code: "240", name: "Equatorial Guinea", flag: "🇬🇶" },
    { code: "291", name: "Eritrea", flag: "🇪🇷" },
    { code: "372", name: "Estonia", flag: "🇪🇪" },
    { code: "268", name: "Eswatini", flag: "🇸🇿" },
    { code: "251", name: "Ethiopia", flag: "🇪🇹" },
    { code: "500", name: "Falkland Islands", flag: "🇫🇰" },
    { code: "298", name: "Faroe Islands", flag: "🇫🇴" },
    { code: "679", name: "Fiji", flag: "🇫🇯" },
    { code: "358", name: "Finland", flag: "🇫🇮" },
    { code: "33", name: "France", flag: "🇫🇷" },
    { code: "594", name: "French Guiana", flag: "🇬🇫" },
    { code: "689", name: "French Polynesia", flag: "🇵🇫" },
    { code: "241", name: "Gabon", flag: "🇬🇦" },
    { code: "220", name: "Gambia", flag: "🇬🇲" },
    { code: "995", name: "Georgia", flag: "🇬🇪" },
    { code: "49", name: "Germany", flag: "🇩🇪" },
    { code: "233", name: "Ghana", flag: "🇬🇭" },
    { code: "350", name: "Gibraltar", flag: "🇬🇮" },
    { code: "30", name: "Greece", flag: "🇬🇷" },
    { code: "299", name: "Greenland", flag: "🇬🇱" },
    { code: "1473", name: "Grenada", flag: "🇬🇩" },
    { code: "590", name: "Guadeloupe", flag: "🇬🇵" },
    { code: "1671", name: "Guam", flag: "🇬🇺" },
    { code: "502", name: "Guatemala", flag: "🇬🇹" },
    { code: "44", name: "Guernsey", flag: "🇬🇬" },
    { code: "224", name: "Guinea", flag: "🇬🇳" },
    { code: "245", name: "Guinea-Bissau", flag: "🇬🇼" },
    { code: "592", name: "Guyana", flag: "🇬🇾" },
    { code: "509", name: "Haiti", flag: "🇭🇹" },
    { code: "504", name: "Honduras", flag: "🇭🇳" },
    { code: "852", name: "Hong Kong", flag: "🇭🇰" },
    { code: "36", name: "Hungary", flag: "🇭🇺" },
    { code: "354", name: "Iceland", flag: "🇮🇸" },
    { code: "91", name: "India", flag: "🇮🇳" },
    { code: "62", name: "Indonesia", flag: "🇮🇩" },
    { code: "98", name: "Iran", flag: "🇮🇷" },
    { code: "964", name: "Iraq", flag: "🇮🇶" },
    { code: "353", name: "Ireland", flag: "🇮🇪" },
    { code: "44", name: "Isle of Man", flag: "🇮🇲" },
    { code: "972", name: "Israel", flag: "🇮🇱" },
    { code: "39", name: "Italy", flag: "🇮🇹" },
    { code: "1876", name: "Jamaica", flag: "🇯🇲" },
    { code: "81", name: "Japan", flag: "🇯🇵" },
    { code: "44", name: "Jersey", flag: "🇯🇪" },
    { code: "962", name: "Jordan", flag: "🇯🇴" },
    { code: "7", name: "Kazakhstan", flag: "🇰🇿" },
    { code: "254", name: "Kenya", flag: "🇰🇪" },
    { code: "686", name: "Kiribati", flag: "🇰🇮" },
    { code: "383", name: "Kosovo", flag: "🇽🇰" },
    { code: "965", name: "Kuwait", flag: "🇰🇼" },
    { code: "996", name: "Kyrgyzstan", flag: "🇰🇬" },
    { code: "856", name: "Laos", flag: "🇱🇦" },
    { code: "371", name: "Latvia", flag: "🇱🇻" },
    { code: "961", name: "Lebanon", flag: "🇱🇧" },
    { code: "266", name: "Lesotho", flag: "🇱🇸" },
    { code: "231", name: "Liberia", flag: "🇱🇷" },
    { code: "218", name: "Libya", flag: "🇱🇾" },
    { code: "423", name: "Liechtenstein", flag: "🇱🇮" },
    { code: "370", name: "Lithuania", flag: "🇱🇹" },
    { code: "352", name: "Luxembourg", flag: "🇱🇺" },
    { code: "853", name: "Macao", flag: "🇲🇴" },
    { code: "389", name: "North Macedonia", flag: "🇲🇰" },
    { code: "261", name: "Madagascar", flag: "🇲🇬" },
    { code: "265", name: "Malawi", flag: "🇲🇼" },
    { code: "60", name: "Malaysia", flag: "🇲🇾" },
    { code: "960", name: "Maldives", flag: "🇲🇻" },
    { code: "223", name: "Mali", flag: "🇲🇱" },
    { code: "356", name: "Malta", flag: "🇲🇹" },
    { code: "692", name: "Marshall Islands", flag: "🇲🇭" },
    { code: "596", name: "Martinique", flag: "🇲🇶" },
    { code: "222", name: "Mauritania", flag: "🇲🇷" },
    { code: "230", name: "Mauritius", flag: "🇲🇺" },
    { code: "262", name: "Mayotte", flag: "🇾🇹" },
    { code: "52", name: "Mexico", flag: "🇲🇽" },
    { code: "691", name: "Micronesia", flag: "🇫🇲" },
    { code: "373", name: "Moldova", flag: "🇲🇩" },
    { code: "377", name: "Monaco", flag: "🇲🇨" },
    { code: "976", name: "Mongolia", flag: "🇲🇳" },
    { code: "382", name: "Montenegro", flag: "🇲🇪" },
    { code: "1664", name: "Montserrat", flag: "🇲🇸" },
    { code: "212", name: "Morocco", flag: "🇲🇦" },
    { code: "258", name: "Mozambique", flag: "🇲🇿" },
    { code: "95", name: "Myanmar", flag: "🇲🇲" },
    { code: "264", name: "Namibia", flag: "🇳🇦" },
    { code: "674", name: "Nauru", flag: "🇳🇷" },
    { code: "977", name: "Nepal", flag: "🇳🇵" },
    { code: "31", name: "Netherlands", flag: "🇳🇱" },
    { code: "687", name: "New Caledonia", flag: "🇳🇨" },
    { code: "64", name: "New Zealand", flag: "🇳🇿" },
    { code: "505", name: "Nicaragua", flag: "🇳🇮" },
    { code: "227", name: "Niger", flag: "🇳🇪" },
    { code: "234", name: "Nigeria", flag: "🇳🇬" },
    { code: "683", name: "Niue", flag: "🇳🇺" },
    { code: "672", name: "Norfolk Island", flag: "🇳🇫" },
    { code: "850", name: "North Korea", flag: "🇰🇵" },
    { code: "1670", name: "Northern Mariana Islands", flag: "🇲🇵" },
    { code: "47", name: "Norway", flag: "🇳🇴" },
    { code: "968", name: "Oman", flag: "🇴🇲" },
    { code: "92", name: "Pakistan", flag: "🇵🇰" },
    { code: "680", name: "Palau", flag: "🇵🇼" },
    { code: "970", name: "Palestine", flag: "🇵🇸" },
    { code: "507", name: "Panama", flag: "🇵🇦" },
    { code: "675", name: "Papua New Guinea", flag: "🇵🇬" },
    { code: "595", name: "Paraguay", flag: "🇵🇾" },
    { code: "51", name: "Peru", flag: "🇵🇪" },
    { code: "63", name: "Philippines", flag: "🇵🇭" },
    { code: "48", name: "Poland", flag: "🇵🇱" },
    { code: "351", name: "Portugal", flag: "🇵🇹" },
    { code: "1787", name: "Puerto Rico", flag: "🇵🇷" },
    { code: "974", name: "Qatar", flag: "🇶🇦" },
    { code: "262", name: "Réunion", flag: "🇷🇪" },
    { code: "40", name: "Romania", flag: "🇷🇴" },
    { code: "7", name: "Russia", flag: "🇷🇺" },
    { code: "250", name: "Rwanda", flag: "🇷🇼" },
    { code: "590", name: "Saint Barthélemy", flag: "🇧🇱" },
    { code: "290", name: "Saint Helena", flag: "🇸🇭" },
    { code: "1869", name: "Saint Kitts & Nevis", flag: "🇰🇳" },
    { code: "1758", name: "Saint Lucia", flag: "🇱🇨" },
    { code: "590", name: "Saint Martin", flag: "🇲🇫" },
    { code: "508", name: "Saint Pierre & Miquelon", flag: "🇵🇲" },
    { code: "1784", name: "Saint Vincent & Grenadines", flag: "🇻🇨" },
    { code: "685", name: "Samoa", flag: "🇼🇸" },
    { code: "378", name: "San Marino", flag: "🇸🇲" },
    { code: "239", name: "São Tomé & Príncipe", flag: "🇸🇹" },
    { code: "966", name: "Saudi Arabia", flag: "🇸🇦" },
    { code: "221", name: "Senegal", flag: "🇸🇳" },
    { code: "381", name: "Serbia", flag: "🇷🇸" },
    { code: "248", name: "Seychelles", flag: "🇸🇨" },
    { code: "232", name: "Sierra Leone", flag: "🇸🇱" },
    { code: "65", name: "Singapore", flag: "🇸🇬" },
    { code: "1721", name: "Sint Maarten", flag: "🇸🇽" },
    { code: "421", name: "Slovakia", flag: "🇸🇰" },
    { code: "386", name: "Slovenia", flag: "🇸🇮" },
    { code: "677", name: "Solomon Islands", flag: "🇸🇧" },
    { code: "252", name: "Somalia", flag: "🇸🇴" },
    { code: "27", name: "South Africa", flag: "🇿🇦" },
    { code: "82", name: "South Korea", flag: "🇰🇷" },
    { code: "211", name: "South Sudan", flag: "🇸🇸" },
    { code: "34", name: "Spain", flag: "🇪🇸" },
    { code: "94", name: "Sri Lanka", flag: "🇱🇰" },
    { code: "249", name: "Sudan", flag: "🇸🇩" },
    { code: "597", name: "Suriname", flag: "🇸🇷" },
    { code: "47", name: "Svalbard & Jan Mayen", flag: "🇸🇯" },
    { code: "46", name: "Sweden", flag: "🇸🇪" },
    { code: "41", name: "Switzerland", flag: "🇨🇭" },
    { code: "963", name: "Syria", flag: "🇸🇾" },
    { code: "886", name: "Taiwan", flag: "🇹🇼" },
    { code: "992", name: "Tajikistan", flag: "🇹🇯" },
    { code: "255", name: "Tanzania", flag: "🇹🇿" },
    { code: "66", name: "Thailand", flag: "🇹🇭" },
    { code: "670", name: "Timor-Leste", flag: "🇹🇱" },
    { code: "228", name: "Togo", flag: "🇹🇬" },
    { code: "690", name: "Tokelau", flag: "🇹🇰" },
    { code: "676", name: "Tonga", flag: "🇹🇴" },
    { code: "1868", name: "Trinidad & Tobago", flag: "🇹🇹" },
    { code: "216", name: "Tunisia", flag: "🇹🇳" },
    { code: "90", name: "Turkey", flag: "🇹🇷" },
    { code: "993", name: "Turkmenistan", flag: "🇹🇲" },
    { code: "1649", name: "Turks & Caicos Islands", flag: "🇹🇨" },
    { code: "688", name: "Tuvalu", flag: "🇹🇻" },
    { code: "1340", name: "U.S. Virgin Islands", flag: "🇻🇮" },
    { code: "256", name: "Uganda", flag: "🇺🇬" },
    { code: "380", name: "Ukraine", flag: "🇺🇦" },
    { code: "971", name: "United Arab Emirates", flag: "🇦🇪" },
    { code: "44", name: "United Kingdom", flag: "🇬🇧" },
    { code: "1", name: "United States", flag: "🇺🇸" },
    { code: "598", name: "Uruguay", flag: "🇺🇾" },
    { code: "998", name: "Uzbekistan", flag: "🇺🇿" },
    { code: "678", name: "Vanuatu", flag: "🇻🇺" },
    { code: "39", name: "Vatican City", flag: "🇻🇦" },
    { code: "58", name: "Venezuela", flag: "🇻🇪" },
    { code: "84", name: "Vietnam", flag: "🇻🇳" },
    { code: "681", name: "Wallis & Futuna", flag: "🇼🇫" },
    { code: "212", name: "Western Sahara", flag: "🇪🇭" },
    { code: "967", name: "Yemen", flag: "🇾🇪" },
    { code: "260", name: "Zambia", flag: "🇿🇲" },
    { code: "263", name: "Zimbabwe", flag: "🇿🇼" },
];

export function SuperAdminUserManagement() {
    const [fullName, setFullName] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [selectedCountryIndex, setSelectedCountryIndex] = useState(() => {
        // Find Kenya's index (code: "254")
        return COUNTRIES.findIndex(c => c.code === "254");
    });
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);
    const [isMappingUser, setIsMappingUser] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [createdUserId, setCreatedUserId] = useState<number | null>(null);
    const [createdUserDetails, setCreatedUserDetails] = useState<{
        fullName: string;
        email: string;
        userId: number;
        role: string;
    } | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleCountryChange = (index: number) => {
        setSelectedCountryIndex(index);
    };

    const fetchEvents = async () => {
        setLoadingEvents(true);
        try {
            const response = await fetch('/api/company-events?companyId=54');
            if (!response.ok) throw new Error('Failed to fetch events');

            const result = await response.json();
            if (result.status && result.data && result.data.events) {
                setEvents(result.data.events);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            toast({
                title: "Error",
                description: "Failed to load events",
                variant: "destructive",
            });
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName.trim() || !emailAddress.trim() || !mobileNumber.trim()) {
            toast({
                title: "Validation Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        setIsCreating(true);
        try {
            // Format phone number with country code
            const selectedCountry = COUNTRIES[selectedCountryIndex];
            let formattedNumber = mobileNumber.trim();

            // If it's a Kenyan number (254), use as is
            // Otherwise, prefix with the selected country code
            if (selectedCountry.code !== '254') {
                // Remove any leading + or country code if already present
                formattedNumber = formattedNumber.replace(/^\+/, '');
                // Add country code if not already present
                if (!formattedNumber.startsWith(selectedCountry.code)) {
                    formattedNumber = selectedCountry.code + formattedNumber;
                }
            } const response = await fetch('/api/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                    emailAddress,
                    mobileNumber: formattedNumber,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create user');
            }

            const data: CreateUserResponse = await response.json();

            if (data.status) {
                setCreatedUserId(data.user.user_id);
                setCreatedUserDetails({
                    fullName,
                    email: emailAddress,
                    userId: data.user.user_id,
                    role: data.user.role,
                });

                // Fetch events after user creation
                fetchEvents();

                toast({
                    title: "Success",
                    description: `User created: ${emailAddress}`,
                });

                // Clear form
                setFullName('');
                setEmailAddress('');
                setMobileNumber('');
                setSelectedCountryIndex(COUNTRIES.findIndex(c => c.code === "254")); // Reset to Kenya
            } else {
                throw new Error(data.message || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create user",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleMapUserToEvent = async (eventId?: string) => {
        const targetEventId = eventId || selectedEventId;

        if (!createdUserId || !targetEventId) {
            toast({
                title: "Validation Error",
                description: "Please create a user and select an event first",
                variant: "destructive",
            });
            return;
        }

        setIsMappingUser(true);
        try {
            const response = await fetch('/api/map-user-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId: parseInt(targetEventId),
                    userId: createdUserId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to map user to event');
            }

            const data = await response.json();

            toast({
                title: "Success",
                description: `User successfully attached to event!`,
            });

            // Reset state
            setCreatedUserId(null);
            setCreatedUserDetails(null);
            setSelectedEventId('');
        } catch (error) {
            console.error('Error mapping user to event:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to attach user to event",
                variant: "destructive",
            });
        } finally {
            setIsMappingUser(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="space-y-2 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
                    Add New User & Attach to Event
                </CardTitle>
                <CardDescription className="text-sm">
                    Create a new event organizer and attach them to an event
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6 pb-6">
                {/* User Creation Form */}
                {!createdUserId && (
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name *</Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="Enter full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    disabled={isCreating}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emailAddress">Email Address *</Label>
                                <Input
                                    id="emailAddress"
                                    type="email"
                                    placeholder="Enter email address"
                                    value={emailAddress}
                                    onChange={(e) => setEmailAddress(e.target.value)}
                                    disabled={isCreating}
                                    required
                                />
                            </div>
                            <div className="space-y-2 lg:col-span-2">
                                <Label htmlFor="mobileNumber">Phone Number *</Label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Select
                                        value={selectedCountryIndex.toString()}
                                        onValueChange={(value) => handleCountryChange(parseInt(value))}
                                        disabled={isCreating}
                                    >
                                        <SelectTrigger className="w-full sm:w-[200px]">
                                            <SelectValue>
                                                <span className="flex items-center gap-1.5">
                                                    <span>{COUNTRIES[selectedCountryIndex].flag}</span>
                                                    <span className="hidden sm:inline">{COUNTRIES[selectedCountryIndex].name}</span>
                                                    <span>+{COUNTRIES[selectedCountryIndex].code}</span>
                                                </span>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {COUNTRIES.map((country, index) => (
                                                <SelectItem key={index} value={index.toString()}>
                                                    {country.flag} {country.name} +{country.code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        id="mobileNumber"
                                        type="tel"
                                        placeholder={COUNTRIES[selectedCountryIndex].code === '254' ? '712345678' : '114477557'}
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        disabled={isCreating}
                                        className="flex-1"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {COUNTRIES[selectedCountryIndex].code === '254'
                                        ? 'Enter phone number without country code (e.g., 712345678)'
                                        : `Enter number without country code. Will be saved as +${COUNTRIES[selectedCountryIndex].code}${mobileNumber}`
                                    }
                                </p>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isCreating}
                            className="w-full sm:w-auto min-h-[44px]"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating User...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Create User
                                </>
                            )}
                        </Button>
                    </form>
                )}

                {/* Event Selection Section */}
                {createdUserId && createdUserDetails && (
                    <div className="space-y-4">
                        {/* User Details Banner */}
                        <div className="rounded-lg border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 p-3 sm:p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <h3 className="font-semibold text-green-900 dark:text-green-100 text-sm sm:text-base">User Created Successfully</h3>
                            </div>
                            <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 break-all">
                                {createdUserDetails.email}
                            </p>
                        </div>

                        <div className="border-t pt-4 sm:pt-6">
                            <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Select Event to Attach User</h3>

                            {loadingEvents ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : events.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No events available
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {events.map((event) => (
                                        <button
                                            key={event.eventId}
                                            onClick={() => {
                                                const eventIdStr = event.eventId.toString();
                                                setSelectedEventId(eventIdStr);
                                                handleMapUserToEvent(eventIdStr);
                                            }}
                                            disabled={isMappingUser}
                                            className={
                                                `group text-left rounded-lg border-2 transition-all hover:border-primary hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${selectedEventId === event.eventId.toString()
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border bg-card'
                                                }`
                                            }
                                        >
                                            {/* Event Poster */}
                                            <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
                                                <img
                                                    src={event.posterUrl || 'https://via.placeholder.com/400x500?text=Event'}
                                                    alt={event.eventName}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'https://via.placeholder.com/400x500?text=Event';
                                                    }}
                                                />
                                            </div>

                                            {/* Event Info */}
                                            <div className="p-3 sm:p-4">
                                                <h4 className="font-semibold line-clamp-2 mb-2 text-sm sm:text-base">
                                                    {event.eventName}
                                                </h4>
                                                {event.location && (
                                                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-1">
                                                        📍 {event.location}
                                                    </p>
                                                )}
                                                <p className="text-xs sm:text-sm font-medium text-primary">
                                                    Tap to attach user
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {isMappingUser && (
                            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground py-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Attaching user to event...</span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
