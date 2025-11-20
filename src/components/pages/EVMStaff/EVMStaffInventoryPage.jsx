import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import {
  Card,
  Table,
  Button,
  InputField,
  Badge,
  LoadingSpinner,
  Alert,
  EmptyState,
} from "../../common";
import { inventoryApi } from "../../../services/inventoryApi";
import { useAuth } from "../../../hooks/useAuth";

function EVMStaffInventoryPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Filter states
  const [filters, setFilters] = useState({
    vehicleModelName: "",
    dealerName: "",
    status: "",
  });

  // Simplified pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const pageSize = 10;

  useEffect(() => {
    if (user?.id) {
      fetchInventory();
    }
  }, [user]);

  // Fetch inventory whenever filters or page changes
  useEffect(() => {
    if (user?.id) {
      fetchInventory();
    }
  }, [filters, currentPage]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setAlert({ type: "", message: "" });

      const response = await inventoryApi.search({
        filters,
        pageNumber: currentPage,
        pageSize: pageSize,
      });

      if (response.isSuccess) {
        const data = response.data || [];
        setInventory(data);
        setFilteredInventory(data);

        // Check if we have more data by seeing if we got a full page
        // If less than pageSize items returned, we've reached the end
        setHasMoreData(data.length === pageSize);
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to load inventory",
        });
        setInventory([]);
        setFilteredInventory([]);
        setHasMoreData(false);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setAlert({
        type: "error",
        message:
          error.response?.data?.messages?.[0] || "Failed to load inventory",
      });
      setInventory([]);
      setFilteredInventory([]);
      setHasMoreData(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to first page when filtering
    setHasMoreData(true); // Reset pagination state
  };

  const handlePageChange = (direction) => {
    if (direction === "next" && hasMoreData) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      setHasMoreData(true); // Re-enable next button when going back
    }
  };

  const clearFilters = () => {
    setFilters({
      vehicleModelName: "",
      dealerName: "",
      status: "",
    });
    setCurrentPage(1);
    setHasMoreData(true);
  };

  const hasActiveFilters =
    filters.vehicleModelName || filters.dealerName || filters.status;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Manufacturer Inventory
            </h1>
            <p className="text-slate-400 mt-0.5 text-sm">
              Manage vehicle stock at manufacturer level
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && filteredInventory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Total Vehicles</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {filteredInventory.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-500"
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
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">At Manufacturer</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {
                      filteredInventory.filter(
                        (item) => item.status === "At Manufacturer"
                      ).length
                    }
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Allocated to Dealer</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {
                      filteredInventory.filter(
                        (item) => item.status === "Allocated to Dealer"
                      ).length
                    }
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Sold</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {
                      filteredInventory.filter((item) => item.status === "sold")
                        .length
                    }
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <InputField
                id="vehicleModelName"
                name="vehicleModelName"
                type="text"
                label="Vehicle Model Name"
                value={filters.vehicleModelName}
                onChange={handleFilterChange}
              />
              <InputField
                id="dealerName"
                name="dealerName"
                type="text"
                label="Dealer Name"
                value={filters.dealerName}
                onChange={handleFilterChange}
              />
              <InputField
                id="status"
                name="status"
                type="text"
                label="Status"
                value={filters.status}
                onChange={handleFilterChange}
              />
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Alert */}
        <Alert type={alert.type} message={alert.message} />

        {/* Inventory Table */}
        <Card padding={false}>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner size="lg" text="Loading inventory..." />
            </div>
          ) : filteredInventory.length === 0 ? (
            <EmptyState
              title="No inventory found"
              description={
                hasActiveFilters
                  ? "Try adjusting your filters"
                  : currentPage > 1
                  ? "No more items. Go back to previous page."
                  : "No items in inventory"
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
              action={
                currentPage > 1 && (
                  <Button
                    onClick={() => handlePageChange("prev")}
                    variant="primary"
                  >
                    Go Back
                  </Button>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.HeaderCell>Model</Table.HeaderCell>
                  <Table.HeaderCell>Dealer</Table.HeaderCell>
                  <Table.HeaderCell>VIN</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Created</Table.HeaderCell>
                  <Table.HeaderCell>Updated</Table.HeaderCell>
                </Table.Header>
                <Table.Body>
                  {filteredInventory.map((item) => (
                    <Table.Row key={item.id}>
                      <Table.Cell>
                        <p className="font-semibold text-white text-sm">
                          {item.vehicleModelName}
                        </p>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-slate-300 text-sm">
                          {item.dealerName}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-slate-300 font-mono text-xs">
                          {item.vinNumber.slice(0, 20)}...
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          variant={
                            item.status === "At Manufacturer"
                              ? "warning"
                              : item.status === "Allocated to Dealer"
                              ? "success"
                              : item.status === "sold"
                              ? "danger"
                              : "default"
                          }
                        >
                          {item.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-slate-400 text-xs">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-slate-400 text-xs">
                          {item.updatedAt
                            ? new Date(item.updatedAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </Card>

        {/* Simplified Pagination Controls */}
        {!loading && (filteredInventory.length > 0 || currentPage > 1) && (
          <Card>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Page{" "}
                <span className="font-semibold text-white">{currentPage}</span>
                {filteredInventory.length > 0 && (
                  <> - Showing {filteredInventory.length} items</>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handlePageChange("prev")}
                  disabled={currentPage === 1 || loading}
                  variant="secondary"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </Button>

                <Button
                  onClick={() => handlePageChange("next")}
                  disabled={
                    !hasMoreData || filteredInventory.length === 0 || loading
                  }
                  variant="secondary"
                >
                  Next
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export default EVMStaffInventoryPage;
