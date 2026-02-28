<script>
import { readFromCollections, pickFirstValue } from "../utils/directus-content";
import { useGlobalLoading } from "../composables/useGlobalLoading";

const urlDirectus = "https://api.netdw.tech";

export default defineNuxtComponent({
  data() {
    return {
      isLoading: true,
      errorMessage: "",
      skeletonCount: 6,
      members: [],
      yearsData: [],
      openYear: "",
    };
  },
  created() {
    this.fetchOrgaos();
  },
  methods: {
    async fetchOrgaos() {
      this.isLoading = true;
      this.errorMessage = "";
      const { start } = useGlobalLoading();
      const stopLoading = start();

      try {
        const { items } = await readFromCollections(
          ["orgaos", "orgaos_sociais"],
          {
            limit: 300,
            sort: ["sort", "-date_created"],
          },
        );

        this.members = (Array.isArray(items) ? items : []).map((item, index) => {
          const name = pickFirstValue(
            item,
            ["nome", "name", "titulo", "title"],
            "",
          );
          const groupFunction = pickFirstValue(
            item,
            ["funcao", "func", "group", "grupo"],
            "",
          );
          const cardRole = pickFirstValue(
            item,
            ["cargo", "role", "funcao", "func"],
            "",
          );
          const rawSort = item?.sort;
          const hasManualSort =
            rawSort !== null && rawSort !== undefined && String(rawSort).trim() !== "";
          const parsedSort = hasManualSort ? Number(rawSort) : Number.NaN;

          return {
            id:
              item?.id ||
              `${name}-${cardRole}-${groupFunction}-${Math.random().toString(16).slice(2)}`,
            sourceIndex: index,
            hasManualSort: hasManualSort && Number.isFinite(parsedSort),
            manualSort:
              hasManualSort && Number.isFinite(parsedSort)
                ? parsedSort
                : Number.MAX_SAFE_INTEGER,
            name,
            groupFunction,
            cardRole,
            academicYear: pickFirstValue(
              item,
              ["ano_letivo", "anoLetivo", "ano", "academic_year", "year"],
              "Sem ano letivo",
            ),
            email: pickFirstValue(item, ["contacto", "email", "mail"], ""),
            photo: pickFirstValue(
              item,
              ["foto", "imagem", "image", "avatar", "photo", "fotografia"],
              "",
            ),
          };
        });

        this.yearsData = this.buildYearsData(this.members);
        this.openYear = this.yearsData[0]?.year || "";
      } catch (error) {
        this.errorMessage = "Não foi possível carregar os órgãos do Directus.";
      } finally {
        this.isLoading = false;
        stopLoading();
      }
    },
    normalizeText(value) {
      return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    },
    getYearSortValue(value) {
      const matches = String(value || "").match(/\d{4}/g) || [];
      if (!matches.length) {
        return 0;
      }

      return Math.max(...matches.map((item) => Number(item)));
    },
    isDirectionRole(groupFunction) {
      const normalizedGroup = this.normalizeText(groupFunction);
      return (
        normalizedGroup === this.normalizeText("Presidente") ||
        normalizedGroup === this.normalizeText("Tesoureiro")
      );
    },
    isPlenarioRole(groupFunction) {
      const normalizedGroup = this.normalizeText(groupFunction);
      return (
        normalizedGroup ===
          this.normalizeText("Presidente da Mesa do Plenário") ||
        normalizedGroup === this.normalizeText("Secretário")
      );
    },
    isPelourosRole(groupFunction) {
      const normalizedGroup = this.normalizeText(groupFunction);
      return normalizedGroup === this.normalizeText("Membro dos pelouros");
    },
    sortByDefinedRoleOrder(list, roleOrder) {
      const normalizedOrder = roleOrder.map((item) => this.normalizeText(item));

      return [...list].sort((firstMember, secondMember) => {
        if (
          firstMember.hasManualSort &&
          secondMember.hasManualSort &&
          firstMember.manualSort !== secondMember.manualSort
        ) {
          return firstMember.manualSort - secondMember.manualSort;
        }

        const firstIndex = normalizedOrder.indexOf(
          this.normalizeText(firstMember.cardRole),
        );
        const secondIndex = normalizedOrder.indexOf(
          this.normalizeText(secondMember.cardRole),
        );
        const safeFirstIndex = firstIndex === -1 ? 999 : firstIndex;
        const safeSecondIndex = secondIndex === -1 ? 999 : secondIndex;

        if (safeFirstIndex !== safeSecondIndex) {
          return safeFirstIndex - safeSecondIndex;
        }

        if (firstMember.hasManualSort && secondMember.hasManualSort) {
          if (firstMember.manualSort !== secondMember.manualSort) {
            return firstMember.manualSort - secondMember.manualSort;
          }
        } else if (firstMember.hasManualSort !== secondMember.hasManualSort) {
          return firstMember.hasManualSort ? -1 : 1;
        }

        if (firstMember.manualSort !== secondMember.manualSort) {
          return firstMember.manualSort - secondMember.manualSort;
        }

        return firstMember.sourceIndex - secondMember.sourceIndex;
      });
    },
    sortByDirectusOrder(list) {
      return [...list].sort((firstMember, secondMember) => {
        if (firstMember.hasManualSort && secondMember.hasManualSort) {
          if (firstMember.manualSort !== secondMember.manualSort) {
            return firstMember.manualSort - secondMember.manualSort;
          }
        } else if (firstMember.hasManualSort !== secondMember.hasManualSort) {
          return firstMember.hasManualSort ? -1 : 1;
        }

        return firstMember.sourceIndex - secondMember.sourceIndex;
      });
    },
    buildYearsData(members) {
      const mapByYear = new Map();

      members.forEach((member) => {
        const yearKey = member.academicYear || "Sem ano letivo";

        if (!mapByYear.has(yearKey)) {
          mapByYear.set(yearKey, []);
        }

        mapByYear.get(yearKey).push(member);
      });

      return Array.from(mapByYear.entries())
        .map(([year, yearMembers]) => {
          const directionMembers = this.sortByDefinedRoleOrder(
            yearMembers.filter((member) =>
              this.isDirectionRole(member.groupFunction),
            ),
            ["Presidente", "Tesoureiro"],
          );

          const plenarioMembers = this.sortByDefinedRoleOrder(
            yearMembers.filter((member) =>
              this.isPlenarioRole(member.groupFunction),
            ),
            ["Presidente da Mesa do Plenário", "Secretário"],
          );

          const pelourosMembers = this.sortByDirectusOrder(
            yearMembers.filter((member) => {
              return this.isPelourosRole(member.groupFunction);
            }),
          );

          return {
            year,
            yearSort: this.getYearSortValue(year),
            sections: [
              {
                key: "direction",
                title: "Direção",
                members: directionMembers,
              },
              {
                key: "plenario",
                title: "Mesa do Plenário",
                members: plenarioMembers,
              },
              {
                key: "pelouros",
                title: "Membros dos Pelouros",
                members: pelourosMembers,
              },
            ],
          };
        })
        .sort((firstYear, secondYear) => {
          if (firstYear.yearSort !== secondYear.yearSort) {
            return secondYear.yearSort - firstYear.yearSort;
          }

          return secondYear.year.localeCompare(firstYear.year, "pt");
        });
    },
    toggleYear(year) {
      this.openYear = this.openYear === year ? "" : year;
    },
    getMemberInitials(name) {
      const cleanName = String(name || "").trim();
      if (!cleanName) {
        return "?";
      }

      return cleanName
        .split(" ")
        .filter((part) => part.length > 0)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
    },
    getImageUrl(fileId) {
      if (!fileId) {
        return "";
      }

      return `${urlDirectus}/assets/${fileId}`;
    },
  },
});
</script>

<template>
  <section class="container page-section">
    <p class="kicker">Órgãos</p>
    <h1>Estrutura organizativa</h1>

    <p v-if="errorMessage" class="status-message">{{ errorMessage }}</p>

    <DirectusSkeleton
      v-if="isLoading"
      variant="orgaos"
      :count="2"
    />

    <p v-else-if="!yearsData.length" class="status-message">
      Ainda não existem órgãos publicados.
    </p>

    <div v-else class="years-accordion">
      <article
        v-for="yearItem in yearsData"
        :key="yearItem.year"
        class="year-item"
      >
        <button
          type="button"
          class="year-toggle"
          @click="toggleYear(yearItem.year)"
        >
          <span>{{ yearItem.year }}</span>
          <i
            class="fa-solid"
            :class="
              openYear === yearItem.year ? 'fa-chevron-up' : 'fa-chevron-down'
            "
            aria-hidden="true"
          ></i>
        </button>

        <div v-if="openYear === yearItem.year" class="year-content">
          <section
            v-for="section in yearItem.sections"
            :key="`${yearItem.year}-${section.key}`"
            class="orgao-section"
          >
            <h2 v-if="section.members.length" class="section-title">
              {{ section.title }}
            </h2>

            <div v-if="section.members.length" class="members-grid">
              <article
                v-for="member in section.members"
                :key="member.id"
                class="member-card"
              >
                <img
                  v-if="member.photo"
                  :src="getImageUrl(member.photo)"
                  :alt="`Fotografia de ${member.name}`"
                  class="member-photo"
                />
                <div v-else class="member-photo-placeholder">
                  {{ getMemberInitials(member.name) }}
                </div>

                <h3 class="member-name">{{ member.name }}</h3>
                <p class="member-role-line">
                  <span class="member-role">{{ member.cardRole }}</span>
                </p>
                <p v-if="member.email" class="member-email">
                  <a
                    :href="`mailto:${member.email}`"
                    class="member-email-icon"
                    :title="member.email"
                    :aria-label="`Enviar email para ${member.name}`"
                  >
                    <i class="fa-regular fa-envelope" aria-hidden="true"></i>
                  </a>
                </p>
              </article>
            </div>
          </section>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.container {
  width: min(1120px, 92%);
  margin: 0 auto;
}

.page-section {
  padding: 3.4rem 0;
}

.kicker {
  margin: 0;
  color: #8baeff;
  font-weight: 600;
}

h1 {
  margin: 0.6rem 0 1.2rem;
  font-size: clamp(1.9rem, 3.8vw, 2.7rem);
}

.status-message {
  color: #c9d8f8;
}

.years-accordion {
  display: grid;
  gap: 0.85rem;
}

.year-item {
  border: 1px solid #263a67;
  border-radius: 0.85rem;
  background: rgba(10, 17, 35, 0.82);
  overflow: hidden;
}

.year-toggle {
  width: 100%;
  border: 0;
  background: rgba(16, 29, 56, 0.72);
  color: #dce8ff;
  padding: 0.9rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.year-content {
  padding: 1rem;
}

.orgao-section + .orgao-section {
  margin-top: 1.5rem;
}

.section-title {
  margin: 0 0 0.8rem;
  text-align: center;
  font-size: 1.08rem;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.member-card {
  border: 1px solid #314a81;
  border-radius: 0.8rem;
  background: rgba(8, 14, 30, 0.72);
  padding: 0.9rem;
  text-align: center;
}

.member-photo,
.member-photo-placeholder {
  width: 90px;
  height: 90px;
  border-radius: 999px;
  margin: 0 auto 0.7rem;
}

.member-photo {
  object-fit: cover;
  display: block;
  border: 1px solid #395693;
}

.member-photo-placeholder {
  display: grid;
  place-items: center;
  background: rgba(38, 62, 113, 0.65);
  color: #d4e4ff;
  font-weight: 700;
}

.member-name {
  margin: 0;
  font-size: 1.02rem;
}

.member-role-line {
  margin: 0.4rem 0 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.42rem;
}

.member-role {
  margin: 0;
  color: #c8d9ff;
  font-size: 0.92rem;
}

.member-email-icon {
  color: #aed0ff;
  text-decoration: none;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.member-email-icon:hover {
  color: #d5e6ff;
}

.member-email {
  margin: 0.5rem 0 0;
}

@media (max-width: 960px) {
  .members-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .members-grid {
    grid-template-columns: 1fr;
  }
}
</style>
