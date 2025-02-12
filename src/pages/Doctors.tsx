import { useState, useEffect, useRef } from "react";
import { doctorApi, type Doctor, type CreateDoctorDto } from "@/api/doctorApi";
import AddDoctorForm from "@/components/doctors/AddDoctorForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDispatch, useSelector } from "react-redux";
import {
  setCacheData,
  selectCacheData,
  clearCacheByPrefix,
  CACHE_DURATIONS,
} from "@/store/cacheSlice";
import { RootState } from "@/store";
import toast from "react-hot-toast";

export default function Doctors() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const dispatch = useDispatch();
  const cacheKey = `doctors_page_${currentPage}_search_${searchTerm}`;
  const cachedData = useSelector((state: RootState) =>
    selectCacheData(state, cacheKey, CACHE_DURATIONS.DOCTORS)
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (cachedData) {
        setDoctors(cachedData.data);
        setIsLoading(false);
        return;
      }

      try {
        // setIsLoading(true);
        setError(null);
        const response = await doctorApi.getAllDoctors();
        console.log(response);
        setTotalPages(response.totalPages);
        setDoctors(response.data);

        dispatch(
          setCacheData({
            key: cacheKey,
            data: response.data,
            totalPages: Math.ceil(response.data.length / itemsPerPage),
          })
        );
      } catch (err) {
        setError("Failed to fetch doctors. Please try again later.");
        console.error("Error fetching doctors:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === "Escape") {
        event.preventDefault();
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // Filter doctors based on search term across all fields
  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.some((spec) =>
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      ) || // Check specialization
      doctor.department.some((dept) =>
        dept.toLowerCase().includes(searchTerm.toLowerCase())
      ) // Check department
  );

  const indexOfLastDoctor = currentPage * itemsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );

  const handleAddDoctor = async (data: CreateDoctorDto) => {
    try {
      const newDoctor = await doctorApi.createDoctor(data);
      setDoctors((prev) => [newDoctor, ...prev]);
      dispatch(clearCacheByPrefix("doctors_")); // Clear all doctor-related cache
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding doctor:", err);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    try {
      await doctorApi.deleteDoctor(id);
      setDoctors((prev) => prev.filter((doctor) => doctor._id !== id));
    } catch (err) {
      console.error("Error deleting doctor:", err);
    }
  };

  const handleUpdateDoctor = async (data: CreateDoctorDto) => {
    try {
      console.log(data);

      if (!editingDoctor?._id) return;
      const updatedDoctor = await doctorApi.updateDoctor(
        editingDoctor._id,
        data
      );

      if (updatedDoctor) {
        console.log("doctors data updated");

        toast.success("Doctors data updated");
      }

      setDoctors((prev) =>
        prev.map((doc) => (doc._id === updatedDoctor._id ? updatedDoctor : doc))
      );
      setEditingDoctor(null);
    } catch (err) {
      console.error("Error updating doctor:", err);
      // Add error handling here
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 flex justify-center items-center h-64">
        {error}
        <button
          //   onClick={fetchDoctors}
          className="ml-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow space-y-6 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-semibold">Doctors</h1>
        </div>

        <div className="flex">
          <Input
            type="text"
            placeholder="Search Doctors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            ref={searchInputRef}
            className="w-full md:w-1/2 lg:w-1/3"
          />
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-primary-600 text-white hover:bg-primary-700 flex items-center"
          >
            + New Doctor
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDoctors?.length > 0 &&
                currentDoctors.map((doctor, index) => (
                  <tr
                    key={doctor._id}
                    className={`hover:bg-gray-100 text-sm md:text-base ${
                      index % 2 ? "bg-gray-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {doctor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                      {doctor.specialization.slice(0, 2).join(", ")}
                      {doctor.specialization.length > 2 && <>..</>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                      {doctor.department.slice(0, 2).join(", ")}
                      {doctor.department.length > 2 && <>..</>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell">
                      {doctor.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm hidden lg:table-cell">
                      {doctor.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm hidden xl:table-cell">
                      {doctor.experience}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-4 items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDoctor(doctor)}
                        >
                          Edit
                        </Button>
                        <Trash2
                          className="text-red-500 cursor-pointer hover:text-red-800"
                          onClick={() => handleDeleteDoctor(doctor._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
            </DialogHeader>
            <AddDoctorForm
              onSubmit={handleAddDoctor}
              onCancel={() => setShowAddForm(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!editingDoctor}
          onOpenChange={(open) => !open && setEditingDoctor(null)}
        >
          <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
            {/* <DialogHeader>
              <DialogTitle>Edit Doctor Details</DialogTitle>
            </DialogHeader> */}
            {editingDoctor && (
              <AddDoctorForm
                initialData={editingDoctor}
                onSubmit={handleUpdateDoctor}
                onCancel={() => setEditingDoctor(null)}
                isEditing={true}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4 mt-auto">
        <div className="flex justify-between items-center max-w-screen-xl mx-auto">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="text-sm md:text-base"
          >
            Previous
          </Button>
          <span className="text-sm md:text-base">Page {currentPage}</span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="text-sm md:text-base"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
