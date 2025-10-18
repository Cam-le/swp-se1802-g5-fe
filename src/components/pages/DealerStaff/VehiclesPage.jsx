import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import { Card, SearchInput, Select, Table, Badge, EmptyState } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { MOCK_VEHICLES } from "../../../data/mockData";
import { formatCurrency, formatShortDate, truncateText } from "../../../utils/helpers";

function VehiclesPage() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [filteredVehicles, setFilteredVehicles] = useState(MOCK_VEHICLES);

    useEffect(() => {
        let list = [...MOCK_VEHICLES];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (v) =>
                    v.model_name.toLowerCase().includes(q) ||
                    (v.version || "").toLowerCase().includes(q) ||
                    (v.category || "").toLowerCase().includes(q)
            );
        }

        if (statusFilter) {
            list = list.filter((v) => v.status === statusFilter);
        }

        setFilteredVehicles(list);
    }, [searchQuery, statusFilter]);

    // Normalize status for consistent display and badge mapping
    const normalizeStatusKey = (status) => {
        if (!status) return "";
        const s = String(status).toLowerCase().replace(/\s+/g, "_");
        if (s === "available") return "available";
        if (s === "coming_soon" || s === "comingsoon" || s === "coming-soon") return "coming_soon";
        if (s === "discontinued") return "discontinued";
        return s;
    };

    const formatStatusLabel = (status) => {
        const key = normalizeStatusKey(status);
        switch (key) {
            case "available":
                return "Available";
            case "coming_soon":
                return "Coming Soon";
            case "discontinued":
                return "Discontinued";
            default:
                // fallback: Title case
                return String(status)
                    .toLowerCase()
                    .split(/[_\s-]+/)
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ");
        }
    };

    const getStatusVariant = (status) => {
        const key = normalizeStatusKey(status);
        switch (key) {
            case "available":
                return "success";
            case "coming_soon":
                return "info";
            case "discontinued":
                return "default";
            default:
                return "default";
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white">Vehicle Page</h1>
                    <p className="text-slate-400">Welcome back, {user?.full_name}!</p>
                </div>

                {/* Filters */}
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <SearchInput
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by model, version, or category..."
                                className="w-full"
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { value: "", label: "All Statuses" },
                                { value: "available", label: "Available" },
                                { value: "coming_soon", label: "Coming Soon" },
                                { value: "discontinued", label: "Discontinued" },
                            ]}
                            placeholder="Filter by status"
                        />
                    </div>
                </Card>

                {/* Vehicle Table  */}
                <Card padding={false}>
                    {filteredVehicles.length === 0 ? (
                        <EmptyState
                            title="No vehicles found"
                            description={
                                searchQuery || statusFilter
                                    ? "Try adjusting your search or filters"
                                    : "No vehicles available"
                            }
                            icon={
                                <svg
                                    className="w-16 h-16 text-slate-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            }
                        />
                    ) : (
                        <Table>
                            <Table.Header>
                                <Table.HeaderCell>Vehicle</Table.HeaderCell>
                                <Table.HeaderCell>Category</Table.HeaderCell>
                                <Table.HeaderCell>Battery & Range</Table.HeaderCell>
                                <Table.HeaderCell align="right">Base Price</Table.HeaderCell>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                            </Table.Header>
                            <Table.Body>
                                {filteredVehicles.map((vehicle) => (
                                    <Table.Row key={vehicle.id}>
                                        <Table.Cell>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={vehicle.image_url}
                                                    alt={vehicle.model_name}
                                                    className="w-16 h-16 rounded-lg object-cover bg-slate-700"
                                                    onError={(e) => {
                                                        e.target.src = "https://via.placeholder.com/150?text=No+Image";
                                                    }}
                                                />
                                                <div>
                                                    <p className="font-semibold text-white">{vehicle.model_name}</p>
                                                    <p className="text-sm text-slate-400">{vehicle.version}</p>
                                                </div>
                                            </div>
                                        </Table.Cell>

                                        <Table.Cell>
                                            <span className="text-slate-300">{vehicle.category}</span>
                                        </Table.Cell>

                                        <Table.Cell>
                                            <div className="text-sm">
                                                <p className="text-slate-300">{vehicle.battery_capacity} kWh</p>
                                                <p className="text-slate-500">{vehicle.range_per_charge} km</p>
                                            </div>
                                        </Table.Cell>

                                        <Table.Cell align="right">
                                            <span className="font-semibold text-white">{formatCurrency(vehicle.base_price)}</span>
                                        </Table.Cell>

                                        <Table.Cell>
                                            <Badge variant={getStatusVariant(vehicle.status)}>
                                                {vehicle.status}
                                            </Badge>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}

export default VehiclesPage;